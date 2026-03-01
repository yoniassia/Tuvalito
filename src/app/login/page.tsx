'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Script from 'next/script'

// Use the global type from etoro-auth.tsx

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [ssoReady, setSsoReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const redirect = searchParams.get('redirect') || '/'

  useEffect(() => {
    // Check if already logged in
    if (ssoReady && window.etoroSSO?.isLoggedIn()) {
      router.push(redirect)
    }
  }, [ssoReady, redirect, router])

  const handleLogin = async () => {
    if (window.etoroSSO) {
      setIsLoading(true)
      const redirectUri = `${window.location.origin}${redirect}`
      await window.etoroSSO.login({ redirectUri })
    }
  }

  return (
    <>
      <Script 
        src="https://clawz.org/etoro-sso/etoro-sso.js" 
        onReady={() => setSsoReady(true)}
      />
      
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#00C896] to-[#00A67E] flex items-center justify-center">
              <span className="text-4xl">📈</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Tuval Finance</h1>
            <p className="text-gray-400">Sign in to access your portfolio</p>
          </div>

          {/* Login Card */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-8">
            <button
              onClick={handleLogin}
              disabled={!ssoReady || isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#00C896] to-[#00A67E] hover:from-[#00D9A0] hover:to-[#00B88C] disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-lg font-semibold text-white shadow-lg shadow-[#00C896]/20 transition-all hover:shadow-[#00C896]/30 disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                  <span>Login with eToro</span>
                </>
              )}
            </button>

            <p className="mt-6 text-center text-sm text-gray-500">
              Secure authentication powered by eToro SSO
            </p>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-600">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C896] to-[#00A67E] flex items-center justify-center animate-pulse">
        <span className="text-3xl">📈</span>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  )
}
