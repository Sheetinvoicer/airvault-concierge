import type { Metadata } from 'next'
import { cookies, headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SiteChrome } from './SiteChrome'
import './globals.css'

export const metadata: Metadata = {
  title: 'AirVault Concierge',
  description: 'Last-minute flights, claims, rides, and pet travel — all in one place.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  let userEmail: string | null = null
  if (token) {
    try {
      const payload = await getPayload({ config })
      // Use the real incoming request headers (Cookie + Sec-Fetch-Site) so Payload's
      // cookie auth accepts the session; a cookie-only headers object gets rejected.
      const authResult = await payload.auth({ headers: await nextHeaders() })
      userEmail = authResult.user?.email ?? null
    } catch {
      // session invalid — show logged-out nav
    }
  }

  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen flex flex-col">
        <SiteChrome userEmail={userEmail}>{children}</SiteChrome>
      </body>
    </html>
  )
}