import { NextResponse } from 'next/server';
import { generateState, generateCodeVerifier, generateCodeChallenge, buildAuthorizationUrl } from '@/lib/etoro-sso';

export async function GET() {
  const clientId = process.env.ETORO_SSO_CLIENT_ID;
  const redirectUri = process.env.ETORO_SSO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'SSO not configured' },
      { status: 500 }
    );
  }

  // Generate PKCE parameters
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Build authorization URL
  const authUrl = buildAuthorizationUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge,
  });

  // Create response with redirect
  const response = NextResponse.redirect(authUrl);

  // Store state and code_verifier in secure cookies
  response.cookies.set('etoro_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  response.cookies.set('etoro_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  return response;
}
