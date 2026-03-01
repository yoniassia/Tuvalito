/**
 * eToro SSO Integration - PKCE Flow
 */

// Generate cryptographically secure random string
export function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map(v => charset[v % charset.length])
    .join('');
}

// Generate code challenge from verifier (SHA-256 + base64url)
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Generate state for CSRF protection
export function generateState(): string {
  return generateRandomString(32);
}

// Generate code verifier for PKCE
export function generateCodeVerifier(): string {
  return generateRandomString(64);
}

// eToro SSO Configuration
export const ETORO_SSO_CONFIG = {
  authorizationEndpoint: 'https://www.etoro.com/sso',
  tokenEndpoint: 'https://www.etoro.com/api/sso/v1/token',
  jwksEndpoint: 'https://www.etoro.com/.well-known/jwks.json',
  scope: 'openid',
};

// Build authorization URL
export function buildAuthorizationUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const searchParams = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: 'code',
    scope: ETORO_SSO_CONFIG.scope,
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
  });
  
  return `${ETORO_SSO_CONFIG.authorizationEndpoint}?${searchParams.toString()}`;
}

// Token response type
export interface TokenResponse {
  id_token: string;
  access_token?: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(params: {
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    grant_type: 'authorization_code',
    redirect_uri: params.redirectUri,
    code: params.code,
    code_verifier: params.codeVerifier,
  });

  const response = await fetch(ETORO_SSO_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

// Decode JWT payload (without validation - validation done server-side)
export function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  
  const payload = parts[1];
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded);
}
