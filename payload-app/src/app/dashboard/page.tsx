import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

interface Claim {
  id: string
  flightId: string
  passenger: string | { id: string; email: string }
  delayMinutes: number
  payoutAmount: number
  status: string
  createdAt: string
}

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-900/40 text-yellow-400 border-yellow-700',
  processing: 'bg-blue-900/40 text-blue-400 border-blue-700',
  paid: 'bg-green-900/40 text-green-400 border-green-700',
  failed: 'bg-red-900/40 text-red-400 border-red-700',
  disputed: 'bg-orange-900/40 text-orange-400 border-orange-700',
}

const quickActions = [
  { icon: '✈️', label: 'Search Flights', href: '/flights' },
  { icon: '💼', label: 'File a Claim', href: '/claims' },
  { icon: '🚗', label: 'Request a Ride', href: '/rides' },
  { icon: '🍽', label: 'Browse Meals', href: '/meals' },
  { icon: '🐾', label: 'Pet Checklist', href: '/pets' },
]

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = await getPayload({ config })

  let userEmail = ''
  let userId = ''
  try {
    const authResult = await payload.auth({
      headers: new Headers({ cookie: `payload-token=${token}` }),
    })
    if (!authResult.user) redirect('/admin/login')
    userEmail = authResult.user.email ?? ''
    userId = String(authResult.user.id)
  } catch {
    redirect('/admin/login')
  }

  // Fetch last 5 claims
  let recentClaims: Claim[] = []
  try {
    const claimsResult = await payload.find({
      collection: 'claims',
      where: { passenger: { equals: userId } },
      limit: 5,
      sort: '-createdAt',
    })
    recentClaims = claimsResult.docs as unknown as Claim[]
  } catch (err) {
    console.error('[dashboard] Failed to fetch claims:', err)
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-indigo-900/60 to-gray-900 border border-indigo-800 rounded-2xl p-8 mb-10 flex justify-between items-center">
          <div>
            <p className="text-indigo-300 text-sm mb-1 uppercase tracking-wide">Welcome back</p>
            <h1 className="text-3xl font-bold">{userEmail}</h1>
            <p className="text-gray-400 mt-1">Here&apos;s your AirVault Concierge overview.</p>
          </div>
          <form action="/api/users/logout" method="POST">
            <button
              type="submit"
              className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Log Out
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-indigo-500 rounded-xl p-5 flex flex-col items-center gap-2 text-center transition group"
              >
                <span className="text-3xl">{action.icon}</span>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Claims */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-300">Recent Claims</h2>
            <Link href="/claims" className="text-sm text-indigo-400 hover:text-indigo-300">
              View all →
            </Link>
          </div>

          {recentClaims.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
              No claims yet.{' '}
              <Link href="/claims" className="text-indigo-400 hover:underline">
                File your first claim
              </Link>
              .
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3">Flight ID</th>
                    <th className="text-left px-4 py-3">Delay</th>
                    <th className="text-left px-4 py-3">Payout</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClaims.map((claim) => (
                    <tr
                      key={claim.id}
                      className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40"
                    >
                      <td className="px-4 py-3 text-white font-mono">{claim.flightId}</td>
                      <td className="px-4 py-3 text-gray-300">{claim.delayMinutes} min</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">${claim.payoutAmount}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block border text-xs px-2 py-0.5 rounded capitalize ${statusBadge[claim.status] ?? 'bg-gray-800 text-gray-400 border-gray-700'}`}
                        >
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
