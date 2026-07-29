import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_JWT_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function normalizeBackendBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

/**
 * Proxies to Express POST /api/auth/register
 * Body: firstName, lastName, email, countryCode (digits), mobileNumber (digits), password
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const firstName = String(body.firstName ?? body.FirstName ?? '').trim();
    const lastName = String(body.lastName ?? body.LastName ?? '').trim();
    const email = String(body.email ?? body.Email ?? '').trim().toLowerCase();
    const countryCode = String(body.countryCode ?? body.MobileNumberCc ?? '91').replace(/\D/g, '') || '91';
    const mobileNumber = String(body.mobileNumber ?? body.MobileNumber ?? '').replace(/\D/g, '');
    const password = String(body.password ?? body.Password ?? '');
    const confirmPassword =
      body.confirmPassword != null ? String(body.confirmPassword) : undefined;

    if (!firstName || !lastName || !email || !mobileNumber || !password) {
      return NextResponse.json(
        { error: 'firstName, lastName, email, mobileNumber, and password are required' },
        { status: 400 },
      );
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const upstream = await fetch(`${backendBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          countryCode,
          mobileNumber,
          password,
          ...(confirmPassword !== undefined ? { confirmPassword } : {}),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let raw: unknown;
      const text = await upstream.text();
      try {
        raw = text ? JSON.parse(text) : {};
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON from register backend', rawResponse: text },
          { status: 502 },
        );
      }

      const errBody = raw as { message?: string; error?: string };

      if (!upstream.ok) {
        const msg = errBody.message || errBody.error || 'Registration failed';
        return NextResponse.json({ error: msg }, { status: upstream.status });
      }

      const data = raw as {
        message?: string;
        token?: string;
        user?: {
          id?: string;
          firstName?: string;
          lastName?: string;
          phone?: string;
          email?: string | null;
          emailVerified?: boolean;
        };
      };

      const expiresIn = DEFAULT_JWT_MAX_AGE_SEC;
      const u = data.user || {};

      const normalized = {
        HttpResponse: {
          Message: data.message || 'Registered successfully',
          StatusCode: 200,
        },
        Content: {
          Token: data.token || '',
          ExpiresIn: expiresIn,
          RefreshToken: '',
          SessionId: '',
          IsVerified: u.emailVerified === true,
          ProfileVerificationId: null as string | null,
          id: u.id != null ? String(u.id) : '',
          firstName: u.firstName ?? '',
          lastName: u.lastName ?? '',
          email: u.email ?? email,
          phone: u.phone ?? '',
        },
      };

      const res = NextResponse.json(normalized, { status: 200 });
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.headers.set('Pragma', 'no-cache');
      res.headers.set('Expires', '0');

      if (data.token) {
        const cryptoModule = await import('crypto');
        const csrfToken = cryptoModule.randomBytes(32).toString('hex');
        const baseCookieOptions = {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' as const,
          path: '/',
          ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
        };

        res.cookies.set('authToken', data.token, {
          ...baseCookieOptions,
          httpOnly: false,
          maxAge: expiresIn,
        });
        res.cookies.set('tokenExpiry', String(Date.now() + expiresIn * 1000), {
          ...baseCookieOptions,
          httpOnly: false,
          maxAge: expiresIn,
        });
        res.cookies.set('csrf-token', csrfToken, {
          ...baseCookieOptions,
          httpOnly: false,
        });
      }

      return res;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
      }
      if (error instanceof Error && error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Unable to reach backend — check BACKEND_URL' },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { error: 'Unexpected error', details: error instanceof Error ? error.message : 'Unknown' },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
