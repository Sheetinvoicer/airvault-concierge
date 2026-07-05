import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AirVault Concierge',
  description: 'Last-minute flights, claims, rides, and pet travel — all in one place.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
