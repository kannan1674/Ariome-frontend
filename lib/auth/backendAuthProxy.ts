import { NextResponse } from 'next/server';
import type { BackendAuthSuccess, LegacyLoginContent, SessionMeta } from './sessionTypes';

export function normalizeBackendBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

export function getBackendBase() {
  return normalizeBackendBaseUrl(
    process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '',
  );
}

function sessionMetaFromBackend(session: SessionMeta | undefined, token: string) {
  if (session?.sessionExpiresAt && session?.accessTokenExpiresAt) {
    return session;
  }
  const sessionMinutes = Number(process.env.SESSION_INFO_EXPIRE_MINUTES) || 30;
  const accessMinutes =
    Number(process.env.JWT_ACCESS_EXPIRE_MINUTES) || sessionMinutes;
  const accessMs = accessMinutes * 60 * 1000;
  const sessionMs = sessionMinutes * 60 * 1000;
  const now = Date.now();
  return {
    sessionExpiresAt: new Date(now + sessionMs).toISOString(),
    accessTokenExpiresAt: new Date(now + accessMs).toISOString(),
    sessionExpiresInSeconds: Math.floor(sessionMs / 1000),
    accessTokenExpiresInSeconds: Math.floor(accessMs / 1000),
    shouldRefreshBefore: new Date(now + accessMs - 60_000).toISOString(),
  };
}

export function toLegacyLoginResponse(data: BackendAuthSuccess) {
  const session = sessionMetaFromBackend(data.session, data.token);
  const accessExpiresMs = new Date(session.accessTokenExpiresAt).getTime();
  const expiresIn = Math.max(
    1,
    Math.floor((accessExpiresMs - Date.now()) / 1000) || session.accessTokenExpiresInSeconds,
  );

  const u = data.user || {};
  const role = u.role || 'user';
  const accountTypeId = role === 'admin' ? 3 : role === 'teacher' ? 2 : 1;

  const content: LegacyLoginContent = {
    Token: data.token,
    ExpiresIn: expiresIn,
    RefreshToken: data.refreshToken || '',
    SessionId: '',
    Session: session,
    IsVerified: u.emailVerified ?? true,
    ProfileVerificationId: null,
    ClubRoleId: accountTypeId,
    accountTypeId,
    AccountTypeId: accountTypeId,
    id: u.id != null ? String(u.id) : '',
    firstName: u.firstName ?? '',
    lastName: u.lastName ?? '',
    email: u.email ?? '',
    phone: u.phone ?? '',
    role,
  };

  return {
    HttpResponse: { Message: 'OK', StatusCode: 200 },
    Content: content,
  };
}

export function attachAuthCookies(
  res: NextResponse,
  data: BackendAuthSuccess,
) {
  const session = sessionMetaFromBackend(data.session, data.token);
  const accessExpiresMs = new Date(session.accessTokenExpiresAt).getTime();
  const refreshExpiresMs = new Date(session.sessionExpiresAt).getTime() + 7 * 24 * 60 * 60 * 1000;
  const tokenMaxAge = Math.max(
    1,
    Math.floor((accessExpiresMs - Date.now()) / 1000) || session.accessTokenExpiresInSeconds,
  );
  const refreshMaxAge = Math.max(tokenMaxAge, Math.floor((refreshExpiresMs - Date.now()) / 1000));

  const baseCookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };

  res.cookies.set('authToken', data.token, {
    ...baseCookieOptions,
    httpOnly: false,
    maxAge: tokenMaxAge,
  });

  if (data.refreshToken) {
    res.cookies.set('refreshToken', data.refreshToken, {
      ...baseCookieOptions,
      httpOnly: false,
      maxAge: refreshMaxAge,
    });
  }

  res.cookies.set('tokenExpiry', String(accessExpiresMs), {
    ...baseCookieOptions,
    httpOnly: false,
    maxAge: tokenMaxAge,
  });

  res.cookies.set('sessionInfo', JSON.stringify(session), {
    ...baseCookieOptions,
    httpOnly: false,
    maxAge: refreshMaxAge,
  });

  const role = data.user?.role;
  if (role === 'user' || role === 'teacher' || role === 'admin') {
    res.cookies.set('userRole', role, {
      ...baseCookieOptions,
      httpOnly: false,
      maxAge: refreshMaxAge,
    });
  }

  return res;
}
