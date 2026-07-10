import { cookies, headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SiteChrome } from '../SiteChrome'

/**
 * Layout for the main (authenticated / marketing) area of the app.
 *
 * This is where the per-request work lives — reading the session cookie and
 * resolving the current user so the navigation can show the right state. It is
 * intentionally *not* part of the root layout, so the auth screens (/login,
 * /signup) can be statically rendered without paying for this server work.
 */
export default async function MainLayout({
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

  return <SiteChrome userEmail={userEmail}>{children}</SiteChrome>
}
