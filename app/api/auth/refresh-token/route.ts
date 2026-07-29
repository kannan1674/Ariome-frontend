import { NextRequest, NextResponse } from 'next/server';
import {
  attachAuthCookies,
  getBackendBase,
  toLegacyLoginResponse,
} from '@/lib/auth/backendAuthProxy';
import type { BackendAuthSuccess } from '@/lib/auth/sessionTypes';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { refreshToken?: string };
    const refreshToken =
      String(body.refreshToken || '').trim() ||
      req.cookies.get('refreshToken')?.value ||
      '';

    if (!refreshToken) {
      return NextResponse.json({ error: 'refreshToken is required' }, { status: 400 });
    }

    const backendBase = getBackendBase();
    if (!backendBase) {
      return NextResponse.json(
        { error: 'Server configuration error — set BACKEND_URL or NEXT_PUBLIC_API_URL' },
        { status: 500 },
      );
    }

    const upstream = await fetch(`${backendBase}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const text = await upstream.text();
    let raw: unknown;
    try {
      raw = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from refresh backend' }, { status: 502 });
    }

    const errBody = raw as { message?: string; error?: string; code?: string };

    if (!upstream.ok) {
      return NextResponse.json(
        { error: errBody.message || errBody.error || 'Refresh failed', code: errBody.code },
        { status: upstream.status },
      );
    }

    const data = raw as {
      token?: string;
      refreshToken?: string;
      session?: BackendAuthSuccess['session'];
      user?: BackendAuthSuccess['user'];
    };

    if (!data.token || !data.session) {
      return NextResponse.json({ error: 'Refresh response missing token or session' }, { status: 502 });
    }

    const authPayload: BackendAuthSuccess = {
      token: data.token,
      refreshToken: data.refreshToken || refreshToken,
      session: data.session,
      user: data.user,
    };

    const normalized = toLegacyLoginResponse(authPayload);
    const res = attachAuthCookies(NextResponse.json(normalized, { status: 200 }), authPayload);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
