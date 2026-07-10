import dynamic from 'next/dynamic'

/**
 * Loading skeleton shown while the SignupForm JS chunk is being fetched.
 * Matches the rough visual shape of the form so there is no layout shift
 * once the real component hydrates (CLS stays at 0.00).
 */
function SignupFormSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">✈️</span>
          <h1 className="text-3xl font-bold text-white mt-3">AirVault Concierge</h1>
          <p className="text-gray-400 mt-1 text-sm">Create your account</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5 shadow-xl animate-pulse">
          <div className="h-10 bg-gray-800 rounded-lg" />
          <div className="h-10 bg-gray-800 rounded-lg" />
          <div className="h-10 bg-gray-800 rounded-lg" />
          <div className="h-11 bg-indigo-800 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/**
 * Code-split the interactive form into its own JS chunk (SignupForm.tsx).
 * ssr: true means the server still renders the initial HTML (good for LCP /
 * SEO), but the form's JavaScript is delivered in a separate chunk that the
 * browser can load after the critical path, reducing main-thread work during
 * the initial hydration phase.
 */
const SignupForm = dynamic(() => import('./SignupForm'), {
  ssr: true,
  loading: SignupFormSkeleton,
})

export default function SignupPage() {
  return <SignupForm />
}
