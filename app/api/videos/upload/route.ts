import { NextRequest, NextResponse } from 'next/server';
import { getBackendBase } from '@/lib/auth/backendAuthProxy';

/** Allow large video uploads through the BFF proxy (up to 2 GB). */
export const maxDuration = 300;

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

    const formData = await req.formData();

    const upstream = await fetch(`${backendBase}/api/videos/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const text = await upstream.text();
    let raw: unknown;
    try {
      raw = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ error: 'Invalid response from upload service' }, { status: 502 });
    }

    if (!upstream.ok) {
      const body = raw as { message?: string };
      return NextResponse.json(
        { error: body.message || 'Upload failed' },
        { status: upstream.status },
      );
    }

    return NextResponse.json(raw, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
