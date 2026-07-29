import { NextRequest, NextResponse } from 'next/server';
import { getBackendBase } from '@/lib/auth/backendAuthProxy';

export async function GET(req: NextRequest) {
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

    const params = new URLSearchParams(req.nextUrl.searchParams);
    if (!params.has('locale')) {
      const locale =
        req.cookies.get('ariome_locale')?.value ||
        req.headers.get('accept-language')?.split(',')[0]?.split('-')[0];
      if (locale) params.set('locale', locale);
    }
    const query = params.toString();
    const upstream = await fetch(
      `${backendBase}/api/videos${query ? `?${query}` : ''}`,
      {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(params.get('locale') ? { 'Accept-Language': params.get('locale')! } : {}),
      },
      cache: 'no-store',
      },
    );

    const text = await upstream.text();
    let raw: unknown;
    try {
      raw = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ error: 'Invalid response from video service' }, { status: 502 });
    }

    if (!upstream.ok) {
      const body = raw as { message?: string; code?: string };
      return NextResponse.json(
        { error: body.message || 'Failed to load videos', code: body.code },
        { status: upstream.status },
      );
    }

    return NextResponse.json(raw, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
