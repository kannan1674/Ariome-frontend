import { NextRequest, NextResponse } from 'next/server';

function normalizeBackendBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

/**
 * Express: POST /api/auth/verify-email-otp — body { email, otp }
 * Also accepts legacy { ProfileVerificationId, OTP } for older clients (not proxied).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const email = String(body.email ?? '').trim().toLowerCase();
    const otp = String(body.otp ?? body.OTP ?? '').trim();

    if (!email || !otp) {
      return NextResponse.json({ error: 'email and otp are required' }, { status: 400 });
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

    const upstream = await fetch(`${backendBase}/api/auth/verify-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    let raw: unknown;
    const text = await upstream.text();
    try {
      raw = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from backend' }, { status: 502 });
    }

    const err = raw as { message?: string };

    if (!upstream.ok) {
      return NextResponse.json({ error: err.message || 'Verification failed' }, { status: upstream.status });
    }

    const ok = raw as { message?: string };
    const normalized = {
      HttpResponse: { Message: ok.message || 'Email verified successfully', StatusCode: 200 },
      Content: email,
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
