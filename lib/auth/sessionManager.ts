import { getCookie, setCookie, deleteCookie } from '@/lib/utils/cookieUtils';
import type { SessionMeta } from './sessionTypes';

const REFRESH_BUFFER_MS = 5_000;
/** Never schedule another refresh sooner than this (prevents tight loops). */
const MIN_REFRESH_INTERVAL_MS = 60_000;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let refreshInFlight: Promise<boolean> | null = null;
let lastRefreshAt = 0;

export function parseSessionMeta(raw: string | null): SessionMeta | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionMeta;
  } catch {
    return null;
  }
}

export function getStoredSessionMeta(): SessionMeta | null {
  return parseSessionMeta(getCookie('sessionInfo'));
}

export function persistSessionMeta(session: SessionMeta, refreshToken?: string) {
  const accessMs = new Date(session.accessTokenExpiresAt).getTime();
  const sessionMs = new Date(session.shouldRefreshBefore || session.sessionExpiresAt).getTime();
  const tokenMaxAge = Math.max(1, Math.floor((accessMs - Date.now()) / 1000));
  const refreshMaxAge = Math.max(tokenMaxAge, Math.floor((sessionMs - Date.now()) / 1000) + 7 * 24 * 3600);

  setCookie('sessionInfo', JSON.stringify(session), { maxAgeSeconds: refreshMaxAge });
  setCookie('tokenExpiry', String(accessMs), { maxAgeSeconds: tokenMaxAge });
  if (refreshToken) {
    setCookie('refreshToken', refreshToken, { maxAgeSeconds: refreshMaxAge });
  }
}

export function clearSessionStorage() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  deleteCookie('sessionInfo');
}

function getRefreshTargetMs(session: SessionMeta): number {
  const accessEnd = new Date(session.accessTokenExpiresAt).getTime();
  const hinted = new Date(session.shouldRefreshBefore || session.accessTokenExpiresAt).getTime();
  // Prefer access-token timing; ignore stale shouldRefreshBefore in the past.
  if (hinted > Date.now() + REFRESH_BUFFER_MS) {
    return hinted;
  }
  return accessEnd - 60_000;
}

function scheduleRefreshAt(session: SessionMeta, onRefresh: () => Promise<boolean>) {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  const targetMs = getRefreshTargetMs(session);
  const delay = Math.max(MIN_REFRESH_INTERVAL_MS, targetMs - Date.now() - REFRESH_BUFFER_MS);

  refreshTimer = setTimeout(async () => {
    await refreshAccessToken(onRefresh);
  }, delay);
}

export async function refreshAccessToken(
  onRefresh?: () => Promise<boolean>,
): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const now = Date.now();
      if (now - lastRefreshAt < MIN_REFRESH_INTERVAL_MS) {
        return true;
      }

      const refreshToken = getCookie('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const res = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('[sessionManager] refresh failed', data);
        return false;
      }

      const content = data?.Content;
      if (!content?.Token || !content?.Session) {
        return false;
      }

      const tokenMaxAge = Number(content.ExpiresIn) || 30 * 60;
      setCookie('authToken', content.Token, { maxAgeSeconds: tokenMaxAge });
      if (content.RefreshToken) {
        setCookie('refreshToken', content.RefreshToken, { maxAgeSeconds: tokenMaxAge + 7 * 24 * 3600 });
      }
      persistSessionMeta(content.Session as SessionMeta, content.RefreshToken);
      lastRefreshAt = Date.now();

      if (onRefresh) {
        await onRefresh();
      }

      scheduleRefreshAt(content.Session as SessionMeta, onRefresh || (() => refreshAccessToken()));
      return true;
    } catch (err) {
      console.error('[sessionManager] refresh error', err);
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function fetchSessionInfo(): Promise<SessionMeta | null> {
  const token = getCookie('authToken');
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/session', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));

    if (
      res.status === 401 &&
      (data?.code === 'SESSION_EXPIRED' || data?.code === 'TOKEN_EXPIRED')
    ) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return getStoredSessionMeta();
      }
      return null;
    }

    if (!res.ok || !data?.session) {
      return null;
    }

    persistSessionMeta(data.session as SessionMeta);
    return data.session as SessionMeta;
  } catch (err) {
    console.error('[sessionManager] fetch session failed', err);
    return null;
  }
}

export function startSessionManager(onRefresh?: () => Promise<boolean>) {
  const session = getStoredSessionMeta();
  if (!session) return;

  const now = Date.now();
  const accessEnd = new Date(session.accessTokenExpiresAt).getTime();

  // Only refresh when the access JWT is near expiry — not on a short session-info window.
  if (accessEnd <= now + REFRESH_BUFFER_MS) {
    void refreshAccessToken(onRefresh);
    return;
  }

  scheduleRefreshAt(session, onRefresh || (() => refreshAccessToken()));
}

export function initSessionAfterLogin(
  session: SessionMeta | undefined,
  onRefresh?: () => Promise<boolean>,
) {
  if (!session) return;
  persistSessionMeta(session);
  void fetchSessionInfo().then((latest) => {
    startSessionManager(onRefresh);
    return latest;
  });
}
