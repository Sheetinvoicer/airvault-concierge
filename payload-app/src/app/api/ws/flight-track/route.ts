/**
 * WebSocket route — real-time flight status broadcast.
 *
 * Next.js App Router does not natively support WebSocket upgrade.
 * This route handles the upgrade manually using the Node.js `ws` library
 * via the `socket` from the underlying IncomingMessage.
 *
 * Usage: connect a WebSocket client to ws://localhost:3000/api/ws/flight-track
 */
import { NextRequest } from 'next/server'
import { WebSocketServer, WebSocket } from 'ws'

// Module-level singleton so the WSS is created once per process
let wss: WebSocketServer | null = null

function getWss(): WebSocketServer {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true })
    wss.on('connection', (ws: WebSocket) => {
      console.info('[WS] Client connected')

      const interval = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          clearInterval(interval)
          return
        }
        const payload = JSON.stringify({
          message: 'Flight updates',
          timestamp: Date.now(),
          flights: [
            { id: 'AA123', status: 'On time', delay: 0 },
            { id: 'BA456', status: 'Delayed', delay: 45 },
          ],
        })
        ws.send(payload)
      }, 5000)

      ws.on('close', () => {
        clearInterval(interval)
        console.info('[WS] Client disconnected')
      })
    })
  }
  return wss
}

export async function GET(req: NextRequest) {
  const rawReq = req as unknown as { socket?: import('net').Socket }
  const socket = rawReq.socket

  if (!socket) {
    return new Response('WebSocket upgrade requires a raw Node.js socket. Run with Next.js server.', {
      status: 426,
      headers: { Upgrade: 'websocket' },
    })
  }

  const server = getWss()
  // Emit the upgrade so ws library handles the handshake
  server.handleUpgrade(
    req as unknown as import('http').IncomingMessage,
    socket,
    Buffer.alloc(0),
    (ws) => server.emit('connection', ws, req),
  )

  // Return an empty response — ws library takes over the socket
  return new Response(null, { status: 101 })
}
