import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AirVault Concierge',
  description: 'Last-minute flights, claims, rides, and pet travel — all in one place.',
}

/**
 * Root layout — deliberately static and free of any per-request work
 * (no cookies, no database, no Payload). Keeping the root static lets the auth
 * screens (/login, /signup) be prerendered as static HTML for a fast TTFB.
 * Per-request auth + navigation live in the (main) route group layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}