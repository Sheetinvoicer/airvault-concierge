'use client'

import dynamic from 'next/dynamic'

/**
 * LoginForm is loaded as a deferred async chunk (ssr: false + Suspense).
 *
 * Why ssr: false?
 * The form uses useSearchParams() which requires a Suspense boundary anyway.
 * By opting out of SSR entirely we keep the server-rendered HTML for this page
 * to a bare minimum (just the loading skeleton below), which:
 *   • removes the LoginForm JS from the render-blocking critical path
 *   • lets Next.js emit it as a separate async chunk that the browser fetches
 *     after LCP has already fired
 *   • eliminates the risk of hydration mismatches from router / searchParams
 *
 * The loading skeleton has the same dimensions as the real form so the layout
 * does not shift when the real component mounts (CLS = 0).
 */
const LoginForm = dynamic(() => import('./LoginForm'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Matches the logo / brand block above the form */}
        <div className="text-center mb-8">
          <span className="text-5xl">✈️</span>
          <h1 className="text-3xl font-bold text-white mt-3">AirVault Concierge</h1>
          <p className="text-gray-400 mt-1 text-sm">Sign in to your account</p>
        </div>

        {/* Skeleton card — same border-box dimensions as the real form */}
        <div
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5 shadow-xl"
          aria-hidden="true"
        >
          {/* email field skeleton */}
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-gray-800 rounded" />
            <div className="h-12 bg-gray-800 rounded-lg" />
          </div>
          {/* password field skeleton */}
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-gray-800 rounded" />
            <div className="h-12 bg-gray-800 rounded-lg" />
          </div>
          {/* button skeleton */}
          <div className="h-12 bg-indigo-900/50 rounded-lg" />
          {/* link skeleton */}
          <div className="h-4 w-48 bg-gray-800 rounded mx-auto" />
        </div>

        <div className="h-5 mt-6" />
      </div>
    </div>
  ),
})

export default function LoginPage() {
  return <LoginForm />
}
