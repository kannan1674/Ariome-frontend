import { refreshAccessToken } from '@/lib/auth/sessionManager';
import { getCookie } from '@/lib/utils/cookieUtils';
import { getTokenFromCookies } from '@/lib/utils/tokenStorage';

const REFRESH_BUFFER_MS = 30_000;

/** True when the API response indicates an expired access token or session. */
export function isAuthExpiredResponse(status: number, body: unknown): boolean {
  if (status !== 401) return false;
  const b = body as { code?: string; error?: string; message?: string } | null;
  const code = (b?.code || '').toUpperCase();
  if (code === 'TOKEN_EXPIRED' || code === 'SESSION_EXPIRED' || code === 'SESSION_INVALID') {
    return true;
  }
  const text = `${b?.error || ''} ${b?.message || ''}`.toLowerCase();
  return (
    text.includes('access token expired') ||
    text.includes('token expired') ||
    text.includes('session expired')
  );
}

export function isAccessTokenExpired(): boolean {
  const expiry = getCookie('tokenExpiry');
  if (!expiry) return false;
  const expiryMs = Number(expiry);
  if (Number.isNaN(expiryMs)) return false;
  return Date.now() >= expiryMs - REFRESH_BUFFER_MS;
}

export function getAuthToken(): string | null {
  return getCookie('authToken') || getTokenFromCookies();
}

/** Refresh proactively when the access token cookie is near expiry. */
export async function ensureValidAccessToken(): Promise<string | null> {
  const token = getAuthToken();
  if (!token) return null;
  if (!isAccessTokenExpired()) return token;

  const refreshed = await refreshAccessToken();
  if (refreshed) {
    return getAuthToken();
  }
  return token;
}

/**
 * fetch() wrapper: refreshes before request if needed, retries once on 401 token expiry.
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  await ensureValidAccessToken();

  const buildHeaders = () => {
    const headers = new Headers(init?.headers);
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  };

  const credentials = init?.credentials ?? 'include';

  let response = await fetch(input, {
    ...init,
    headers: buildHeaders(),
    credentials,
  });

  if (response.status !== 401) {
    return response;
  }

  let body: unknown = {};
  try {
    body = await response.clone().json();
  } catch {
    /* non-JSON */
  }

  if (!isAuthExpiredResponse(401, body)) {
    return response;
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    return response;
  }

  response = await fetch(input, {
    ...init,
    headers: buildHeaders(),
    credentials,
  });

  return response;
}
