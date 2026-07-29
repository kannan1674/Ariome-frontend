import { NextRequest, NextResponse } from 'next/server';
import { getBackendBase } from '@/lib/auth/backendAuthProxy';

function getToken(req: NextRequest) {
  return (
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
    req.cookies.get('authToken')?.value
  );
}

export async function GET(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const backendBase = getBackendBase();
    if (!backendBase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const upstream = await fetch(`${backendBase}/api/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const text = await upstream.text();
    let raw: unknown;
    try {
      raw = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ error: 'Invalid response from admin service' }, { status: 502 });
    }

    if (!upstream.ok) {
      const body = raw as { message?: string; error?: string };
      return NextResponse.json(
        {
          error: body.message || body.error || 'Failed to load dashboard',
          code: body.code,
        },
        { status: upstream.status },
      );
    }

    return NextResponse.json(raw, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
