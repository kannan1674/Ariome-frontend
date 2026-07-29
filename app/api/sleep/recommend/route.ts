import { NextRequest, NextResponse } from 'next/server';
import { getBackendBase } from '@/lib/auth/backendAuthProxy';

export async function POST(req: NextRequest) {
  try {
    const token =
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
      req.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const backendBase = getBackendBase();
    if (!backendBase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await req.json();
    const upstream = await fetch(`${backendBase}/api/sleep/recommend`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await upstream.text();
    let raw: unknown;
    try {
      raw = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ error: 'Invalid response from sleep service' }, { status: 502 });
    }

    if (!upstream.ok) {
      const err = raw as { message?: string };
      return NextResponse.json(
        { error: err.message || 'Sleep recommendations failed' },
        { status: upstream.status },
      );
    }

    return NextResponse.json(raw, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
