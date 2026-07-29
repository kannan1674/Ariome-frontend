import { NextRequest, NextResponse } from 'next/server';
import { backendApiUrl, getBackendBase } from '@/lib/auth/backendAuthProxy';

/** Digits-only country calling code for legacy payloads (e.g. "91", "1"). */
function dialCodeToNumeric(dialCode: string) {
  return String(dialCode || '').replace(/\D/g, '');
}

/** Display form always includes a leading + */
function dialCodeToDisplay(dialCode: string) {
  const trimmed = String(dialCode || '').trim();
  if (!trimmed) return '';
  return trimmed.startsWith('+') ? trimmed : `+${trimmed.replace(/^\+/, '')}`;
}

export async function GET(_req: NextRequest) {
  try {
    const fullUrl = backendApiUrl('/auth/country-codes');

    if (!fullUrl || !getBackendBase()) {
      return NextResponse.json(
        { error: 'Server configuration error - set BACKEND_URL or NEXT_PUBLIC_API_URL' },
        { status: 500 },
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let raw: unknown;
      const responseText = await response.text();
      try {
        raw = responseText ? JSON.parse(responseText) : {};
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON from country-codes backend', rawResponse: responseText },
          { status: 502 },
        );
      }

      if (!response.ok) {
        return NextResponse.json(
          typeof raw === 'object' && raw !== null ? raw : { error: 'Country codes request failed' },
          { status: response.status },
        );
      }

      const body = raw as {
        countryCodes?: Array<{ name?: string; iso2?: string; dialCode?: string }>;
      };
      const list = Array.isArray(body.countryCodes) ? body.countryCodes : [];

      const Content = list.map((row) => {
        const iso2 = String(row.iso2 || '').toUpperCase();
        const dialDisplay = dialCodeToDisplay(String(row.dialCode || ''));
        const codeDigits = dialCodeToNumeric(String(row.dialCode || ''));
        return {
          Id: iso2,
          Country: String(row.name || '').trim() || iso2,
          CountryCode: iso2,
          Code: codeDigits,
          DialDisplay: dialDisplay,
          iso2,
          dialCode: dialDisplay || (codeDigits ? `+${codeDigits}` : ''),
          name: String(row.name || '').trim(),
        };
      });

      const payload = {
        HttpResponse: { Message: 'OK', StatusCode: 200 },
        Content,
      };

      const res = NextResponse.json(payload, { status: 200 });
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.headers.set('Pragma', 'no-cache');
      res.headers.set('Expires', '0');
      return res;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return NextResponse.json({ error: 'Request timeout - please try again' }, { status: 408 });
        }
        if (error.message.includes('fetch')) {
          return NextResponse.json(
            { error: 'Unable to connect to backend - check BACKEND_URL and that the API is running' },
            { status: 503 },
          );
        }
      }

      return NextResponse.json(
        { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 },
      );
    }
  } catch (_error) {
    return NextResponse.json({ error: 'Server error occurred' }, { status: 500 });
  }
}