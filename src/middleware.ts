import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that don't require authentication
const publicPaths = [
  '/api/auth',
  '/auth/callback',
  '/etoro-sso',
  '/_next',
  '/favicon.ico',
  '/login',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Check for auth cookies (clawz.org SSO or custom)
  const ssoUser = request.cookies.get('etoro_sso_user')?.value
  const ssoSession = request.cookies.get('etoro_sso_session')?.value
  const customLoggedIn = request.cookies.get('logged_in')?.value === 'true'
  
  const isLoggedIn = !!(ssoUser || ssoSession || customLoggedIn)
  
  if (!isLoggedIn) {
    // Redirect to login page
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
