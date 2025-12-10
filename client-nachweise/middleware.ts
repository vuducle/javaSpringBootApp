import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088';

function safeDecodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let payload = parts[1];
    // make base64 URL safe -> base64
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4) payload += '=';
    // atob exists in the edge runtime
    const json = atob(payload);
    return JSON.parse(json);
  } catch (_e) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  // Only protect matched routes via config.matcher below
  const cookie =
    req.cookies.get('accessToken') || req.cookies.get('token');
  const token = cookie?.value;

  if (!token) {
    // not authenticated -> redirect to login
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Try to validate token with backend (preferred)
  try {
    const validateRes = await fetch(`${API_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!validateRes.ok) {
      // token invalid on backend
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  } catch (_e) {
    // network/other error: we'll fallback to decoding the token.
  }

  // decode token payload to read roles claim
  const payload = safeDecodeJwtPayload(token);
  const roles: string[] = Array.isArray(payload?.roles)
    ? payload.roles
    : typeof payload?.roles === 'string'
    ? [payload.roles]
    : [];

  if (!roles.includes('ROLE_ADMIN')) {
    // not allowed
    const homeUrl = new URL('/', req.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/user/:path*',
    '/users/:path*',
    '/admin/:path*',
    '/features/user/:path*',
  ],
};
