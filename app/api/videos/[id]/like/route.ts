import { NextRequest, NextResponse } from 'next/server';
import { getBackendBase } from '@/lib/auth/backendAuthProxy';

function getToken(req: NextRequest) {
  return (
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
    req.cookies.get('authToken')?.value
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const backendBase = getBackendBase();
    if (!backendBase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const upstream = await fetch(`${backendBase}/api/videos/${id}/like`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const text = await upstream.text();
    let raw: unknown;
    try {
      raw = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ error: 'Invalid response' }, { status: 502 });
    }

    if (!upstream.ok) {
      const body = raw as { message?: string; error?: string; code?: string };
      return NextResponse.json(
        { error: body.message || body.error || 'Failed', code: body.code },
        { status: upstream.status },
      );
    }

    return NextResponse.json(raw, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
