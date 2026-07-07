import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
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
      const authResult = await payload.auth({
        headers: new Headers({ cookie: `payload-token=${token}` }),
      })
      userEmail = authResult.user?.email ?? null
    } catch {
      // session invalid — show logged-out nav
    }
  }

  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen flex flex-col">
        {/* Navigation Header */}
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-white hover:text-indigo-400 transition">
              ✈️ AirVault Concierge
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-gray-300 hover:text-white transition">
                Home
              </Link>
              <Link href="/flights" className="text-gray-300 hover:text-white transition">
                Flights
              </Link>
              <Link href="/claims" className="text-gray-300 hover:text-white transition">
                Claims
              </Link>
              <Link href="/rides" className="text-gray-300 hover:text-white transition">
                Rides
              </Link>
              <Link href="/meals" className="text-gray-300 hover:text-white transition">
                Meals
              </Link>
              <Link href="/pets" className="text-gray-300 hover:text-white transition">
                Pets
              </Link>
              {userEmail ? (
                <>
                  <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
                    Dashboard
                  </Link>
                  <span className="text-gray-400 text-xs border border-gray-700 px-2 py-1 rounded">
                    {userEmail}
                  </span>
                  <form action="/api/users/logout" method="POST">
                    <input type="hidden" name="_redirect" value="/" />
                    <button
                      type="submit"
                      className="bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs transition"
                    >
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-300 hover:text-white transition">
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 text-center text-gray-400 text-sm py-6">
          &copy; {new Date().getFullYear()} AirVault Concierge. All rights reserved.
        </footer>
      </body>
    </html>
  )
}