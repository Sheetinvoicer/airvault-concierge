import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = await getPayload({ config })
  try {
    const authResult = await payload.auth({ headers: new Headers({ cookie: `payload-token=${token}` }) })
    const user = authResult.user
    if (!user) {
      redirect('/login')
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="mb-2">Welcome, {user.email}!</p>
        <p className="text-gray-600">This is your personal dashboard.</p>
        <form action="/api/users/logout" method="POST">
          <button
            type="submit"
            className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Log Out
          </button>
        </form>
      </div>
    )
  } catch {
    redirect('/login')
  }
}
