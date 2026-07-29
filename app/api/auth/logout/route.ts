import { NextRequest, NextResponse } from 'next/server';
import { getBackendBase } from '@/lib/auth/backendAuthProxy';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token =
      authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : req.cookies.get('authToken')?.value;

    const backendBase = getBackendBase();
    if (backendBase && token) {
      try {
        await fetch(`${backendBase}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
      } catch {
        // still clear cookies locally
      }
    }

    const res = NextResponse.json({ message: 'Logged out successfully' });
    const cookieOpts = {
      path: '/',
      maxAge: 0,
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    };
    res.cookies.set('authToken', '', cookieOpts);
    res.cookies.set('refreshToken', '', cookieOpts);
    res.cookies.set('tokenExpiry', '', cookieOpts);
    res.cookies.set('sessionInfo', '', cookieOpts);
    res.cookies.set('sessionId', '', cookieOpts);
    return res;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
