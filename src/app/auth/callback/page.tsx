'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (errorParam) {
      setStatus('error')
      setError(errorDescription || 'Login was cancelled')
      return
    }

    if (!code || !state) {
      setStatus('error')
      setError('Missing authorization parameters')
      return
    }

    // Forward to our API callback handler
    const callbackUrl = `/api/auth/etoro/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
    window.location.href = callbackUrl

  }, [searchParams, router])

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#161B22] border border-[#30363D] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Authentication Failed</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#00C896] hover:bg-[#00D9A0] text-white font-semibold rounded-xl transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#161B22] border border-[#30363D] rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#00C896]/20 flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-[#00C896] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Signing you in...</h1>
        <p className="text-gray-400">Please wait while we complete your authentication.</p>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#161B22] border border-[#30363D] rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#00C896]/20 flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-[#00C896] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Loading...</h1>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
