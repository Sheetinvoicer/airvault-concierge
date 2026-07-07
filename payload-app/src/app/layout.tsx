import type { Metadata } from ''
import Link from '/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'AirVault Concierge',
  description: 'Last-minute flights, claims, rides, and pet travel — all in one place.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Navigation Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-blue-700">
              ✈️ AirVault Concierge
            </Link>
            <nav className="space-x-4 text-sm">
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Home
              </Link>
              <Link href="/flights" className="text-gray-600 hover:text-blue-600">
                Flights
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
              <Link href="/signup" className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700">
                Sign Up
              </Link>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>

        {/* Simple Footer */}
        <footer className="text-center text-gray-500 text-sm py-6 border-t border-gray-200 mt-8">
          &copy; {new Date().getFullYear()} AirVault Concierge. All rights reserved.
        </footer>
      </body>
    </html>
  )
}