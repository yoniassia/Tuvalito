import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, decodeJwtPayload } from '@/lib/etoro-sso';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const returnedState = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    const errorDescription = searchParams.get('error_description') || 'Login cancelled';
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorDescription)}`, request.url)
    );
  }

  // Get stored values from cookies
  const storedState = request.cookies.get('etoro_state')?.value;
  const codeVerifier = request.cookies.get('etoro_code_verifier')?.value;

  // Validate state (CSRF protection)
  if (!storedState || returnedState !== storedState) {
    return NextResponse.redirect(
      new URL('/?error=State+mismatch+-+please+try+again', request.url)
    );
  }

  if (!code || !codeVerifier) {
    return NextResponse.redirect(
      new URL('/?error=Missing+authorization+code', request.url)
    );
  }

  const clientId = process.env.ETORO_SSO_CLIENT_ID;
  const clientSecret = process.env.ETORO_SSO_CLIENT_SECRET;
  const redirectUri = process.env.ETORO_SSO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(
      new URL('/?error=SSO+not+configured', request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens({
      code,
      codeVerifier,
      clientId,
      clientSecret,
      redirectUri,
    });

    // Decode ID token to get user info
    const idTokenPayload = decodeJwtPayload(tokens.id_token);
    const etoroUserId = idTokenPayload.sub as string;

    // Create session response
    const response = NextResponse.redirect(new URL('/', request.url));

    // Clear PKCE cookies
    response.cookies.delete('etoro_state');
    response.cookies.delete('etoro_code_verifier');

    // Set session cookie with user info
    // In production, you'd want to create a proper session and store tokens securely
    response.cookies.set('etoro_user', JSON.stringify({
      id: etoroUserId,
      authenticated: true,
      loginTime: Date.now(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Also set a client-readable cookie for UI state
    response.cookies.set('logged_in', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (err) {
    console.error('Token exchange error:', err);
    return NextResponse.redirect(
      new URL('/?error=Authentication+failed', request.url)
    );
  }
}
