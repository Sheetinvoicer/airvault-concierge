/**
 * Next.js instrumentation hook — runs once in the Node.js server process.
 * Used to start the Kafka delay consumer without blocking the HTTP server.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    const { startDelayConsumer } = await import('./lib/kafka/consumer')
    startDelayConsumer(payload).catch((err) =>
      console.error('[instrumentation] Kafka consumer startup error:', err),
    )
  }
}
