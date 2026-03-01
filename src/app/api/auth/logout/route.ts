import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/', request.url));
  
  // Clear all auth cookies
  response.cookies.delete('etoro_user');
  response.cookies.delete('logged_in');
  response.cookies.delete('etoro_state');
  response.cookies.delete('etoro_code_verifier');
  
  return response;
}

export async function POST(request: Request) {
  return GET(request);
}
