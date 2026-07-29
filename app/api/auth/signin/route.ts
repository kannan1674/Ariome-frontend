import { NextRequest, NextResponse } from 'next/server';
import {
  attachAuthCookies,
  getBackendBase,
  toLegacyLoginResponse,
} from '@/lib/auth/backendAuthProxy';
import type { BackendAuthSuccess } from '@/lib/auth/sessionTypes';

function buildIdentifierFromLegacyBody(body: Record<string, unknown>): string {
  const username = String(body.Username ?? '').trim();
  if (!username) return '';
  if (username.includes('@')) {
    return username.toLowerCase();
  }
  const cc = String(body.MobileNumberCc ?? '91').replace(/\D/g, '') || '91';
  const mobileDigits = username.replace(/\D/g, '');
  return mobileDigits ? `${cc}${mobileDigits}` : '';
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const password = String(body.password ?? body.Password ?? '').trim();
    let identifier =
      typeof body.identifier === 'string' ? body.identifier.trim() : '';
    if (!identifier) {
      identifier = buildIdentifierFromLegacyBody(body);
    }

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'identifier (email or phone with country code) and password are required' },
        { status: 400 },
      );
    }

    const backendBase = getBackendBase();
    if (!backendBase) {
      return NextResponse.json(
        { error: 'Server configuration error — set BACKEND_URL or NEXT_PUBLIC_API_URL' },
        { status: 500 },
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const upstream = await fetch(`${backendBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ identifier, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const text = await upstream.text();
      let raw: unknown;
      try {
        raw = text ? JSON.parse(text) : {};
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON from login backend', rawResponse: text },
          { status: 502 },
        );
      }

      const errBody = raw as { message?: string; error?: string; code?: string };

      if (!upstream.ok) {
        const msg = errBody.message || errBody.error || 'Login failed';
        return NextResponse.json(
          { error: msg, code: errBody.code },
          { status: upstream.status },
        );
      }

      const data = raw as BackendAuthSuccess & {
        token?: string;
        refreshToken?: string;
        session?: BackendAuthSuccess['session'];
        user?: BackendAuthSuccess['user'];
      };

      if (!data.token || !data.refreshToken || !data.session) {
        return NextResponse.json(
          { error: 'Login response missing token, refreshToken, or session' },
          { status: 502 },
        );
      }

      const authPayload: BackendAuthSuccess = {
        token: data.token,
        refreshToken: data.refreshToken,
        session: data.session,
        user: data.user,
      };

      const normalized = toLegacyLoginResponse(authPayload);
      const res = attachAuthCookies(NextResponse.json(normalized, { status: 200 }), authPayload);

      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.headers.set('Pragma', 'no-cache');
      res.headers.set('Expires', '0');

      const cryptoModule = await import('crypto');
      const csrfToken = cryptoModule.randomBytes(32).toString('hex');
      res.cookies.set('csrf-token', csrfToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        httpOnly: false,
        ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
      });

      return res;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout — try again' }, { status: 408 });
      }
      if (error instanceof Error && error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Unable to reach backend — check BACKEND_URL and that the API is running' },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { error: 'Unexpected error', details: error instanceof Error ? error.message : 'Unknown' },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
