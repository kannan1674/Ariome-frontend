import { NextRequest, NextResponse } from 'next/server';
import { getBackendBase } from '@/lib/auth/backendAuthProxy';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token =
      authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : req.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ isAuthenticated: false, session: null }, { status: 401 });
    }

    const backendBase = getBackendBase();
    if (!backendBase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const upstream = await fetch(`${backendBase}/api/auth/session`, {
      method: 'GET',
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
      return NextResponse.json({ error: 'Invalid JSON from session backend' }, { status: 502 });
    }

    const body = raw as {
      session?: unknown;
      user?: { id?: string };
      message?: string;
      code?: string;
    };

    if (!upstream.ok) {
      return NextResponse.json(
        {
          isAuthenticated: false,
          session: null,
          message: body.message,
          code: body.code,
        },
        { status: upstream.status },
      );
    }

    return NextResponse.json(
      {
        isAuthenticated: true,
        session: body.session,
        user: body.user,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ isAuthenticated: false, session: null }, { status: 500 });
  }
}
