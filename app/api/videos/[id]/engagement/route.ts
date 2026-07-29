import { NextRequest, NextResponse } from 'next/server';
import { getBackendBase } from '@/lib/auth/backendAuthProxy';

function getToken(req: NextRequest) {
  return (
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
    req.cookies.get('authToken')?.value
  );
}

async function proxy(req: NextRequest, id: string, init: RequestInit) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const backendBase = getBackendBase();
  if (!backendBase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const upstream = await fetch(`${backendBase}/api/videos/${id}/engagement`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  });

  const text = await upstream.text();
  let raw: unknown;
  try {
    raw = text ? JSON.parse(text) : {};
  } catch {
    return NextResponse.json({ error: 'Invalid response from video service' }, { status: 502 });
  }

  if (!upstream.ok) {
    const body = raw as { message?: string; error?: string; code?: string };
    return NextResponse.json(
      { error: body.message || body.error || 'Request failed', code: body.code },
      { status: upstream.status },
    );
  }

  return NextResponse.json(raw, { status: upstream.status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return proxy(req, id, { method: 'GET' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
