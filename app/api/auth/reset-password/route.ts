import { NextRequest, NextResponse } from 'next/server';
import { normalizeBackendBaseUrl } from '@/lib/auth/backendAuthProxy';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const email = String(body.email ?? '').trim().toLowerCase();
    const newPassword = String(body.newPassword ?? '').trim();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'email and newPassword are required' }, { status: 400 });
    }

    const backendBase = normalizeBackendBaseUrl(
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '',
    );
    if (!backendBase) {
      return NextResponse.json(
        { error: 'Server configuration error — set BACKEND_URL or NEXT_PUBLIC_API_URL' },
        { status: 500 },
      );
    }

    const upstream = await fetch(`${backendBase}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });

    const text = await upstream.text();
    let raw: unknown;
    try {
      raw = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from backend' }, { status: 502 });
    }

    if (!upstream.ok) {
      const err = raw as { message?: string };
      return NextResponse.json({ error: err.message || 'Reset password failed' }, { status: upstream.status });
    }

    const ok = raw as { message?: string };
    return NextResponse.json(
      {
        HttpResponse: { Message: ok.message || 'Password reset successful', StatusCode: 200 },
        Content: email,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}