import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import ClaimForm from './ClaimForm'

interface Claim {
  id: string
  flightId: string
  passengerId: string
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

export default async function ClaimsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = await getPayload({ config })

  let userEmail = ''
  let userId = ''
  try {
    const authResult = await payload.auth({
      headers: new Headers({ cookie: `payload-token=${token}` }),
    })
    if (!authResult.user) redirect('/login')
    userEmail = authResult.user.email ?? ''
    userId = String(authResult.user.id)
  } catch {
    redirect('/login')
  }

  // Fetch the user's claims server-side
  const claimsResult = await payload.find({
    collection: 'claims',
    where: { passengerId: { equals: userId } },
    limit: 20,
    sort: '-createdAt',
  })

  const claims = claimsResult.docs as unknown as Claim[]

  return (
    <div className="bg-gray-950 min-h-screen text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">💼 Claims</h1>
          <p className="text-gray-400">
            File delay-compensation claims and track their status.
          </p>
        </div>

        {/* File New Claim */}
        <div className="mb-12">
          <ClaimForm />
        </div>

        {/* Claims History */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Your Claims History</h2>
          {claims.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
              No claims yet. Submit your first claim above.
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
                  {claims.map((claim) => (
                    <tr key={claim.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40">
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
