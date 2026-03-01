'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

// Declare the global etoroSSO object
declare global {
  interface Window {
    etoroSSO?: {
      login: (options?: { redirectUri?: string }) => Promise<void>;
      logout: () => void;
      getUser: () => { username: string; etoroUserId: string; email?: string; name?: string } | null;
      isLoggedIn: () => boolean;
      onAuthChange: (callback: (user: any) => void) => void;
    };
  }
}

export function EtoroAuthButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [ssoReady, setSsoReady] = useState(false)

  useEffect(() => {
    // Check login state when SSO is ready
    if (ssoReady && window.etoroSSO) {
      setIsLoggedIn(window.etoroSSO.isLoggedIn())
      setIsLoading(false)
      
      // Listen for auth changes
      window.etoroSSO.onAuthChange((user) => {
        setIsLoggedIn(!!user)
      })
    }
  }, [ssoReady])

  const handleLogin = async () => {
    if (window.etoroSSO) {
      setIsLoading(true)
      await window.etoroSSO.login()
    }
  }

  const handleLogout = () => {
    if (window.etoroSSO) {
      window.etoroSSO.logout()
      setIsLoggedIn(false)
    }
  }

  return (
    <>
      <Script 
        src="/etoro-sso/etoro-sso.js" 
        onReady={() => setSsoReady(true)}
      />
      
      {isLoading ? (
        <div className="w-24 h-10 bg-[#161B22] rounded-xl animate-pulse" />
      ) : isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-[#161B22] hover:bg-[#30363D] border border-[#30363D] rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all"
        >
          <span className="w-6 h-6 rounded-full bg-[#00C896] flex items-center justify-center text-xs text-white">
            ✓
          </span>
          <span>Sign Out</span>
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00C896] to-[#00A67E] hover:from-[#00D9A0] hover:to-[#00B88C] rounded-xl text-sm font-semibold text-white shadow-lg shadow-[#00C896]/20 transition-all hover:shadow-[#00C896]/30"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
          <span>Login with eToro</span>
        </button>
      )}
    </>
  )
}

// Compact version for mobile
export function EtoroAuthButtonMobile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [ssoReady, setSsoReady] = useState(false)

  useEffect(() => {
    if (ssoReady && window.etoroSSO) {
      setIsLoggedIn(window.etoroSSO.isLoggedIn())
      setIsLoading(false)
      
      window.etoroSSO.onAuthChange((user) => {
        setIsLoggedIn(!!user)
      })
    }
  }, [ssoReady])

  const handleLogin = async () => {
    if (window.etoroSSO) {
      await window.etoroSSO.login()
    }
  }

  const handleLogout = () => {
    if (window.etoroSSO) {
      window.etoroSSO.logout()
      setIsLoggedIn(false)
    }
  }

  return (
    <>
      <Script 
        src="/etoro-sso/etoro-sso.js" 
        onReady={() => setSsoReady(true)}
      />
      
      {isLoading ? (
        <div className="w-10 h-10 bg-[#161B22] rounded-full animate-pulse" />
      ) : isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-full bg-[#00C896] flex items-center justify-center text-white"
          title="Sign Out"
        >
          ✓
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00C896] to-[#00A67E] flex items-center justify-center text-white shadow-lg shadow-[#00C896]/20"
          title="Login with eToro"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </button>
      )}
    </>
  )
}
