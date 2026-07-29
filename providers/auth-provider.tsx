'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/store';
import {
  loginSuccess,
  logout,
  updateSessionTokens,
  setSessionBootstrapped,
} from '@/lib/features/auth/authSlice';
import { getProfileInfo } from '@/lib/Actions/authActions';
import { accountTypeIdFromRole } from '@/lib/auth/resolveUserRole';
import { getCookie } from '@/lib/utils/cookieUtils';
import { validateAuthToken } from '@/lib/utils';
import { isAccessTokenExpired } from '@/lib/auth/authenticatedFetch';
import {
  fetchSessionInfo,
  refreshAccessToken,
  startSessionManager,
  clearSessionStorage,
} from '@/lib/auth/sessionManager';
import type { SessionMeta } from '@/lib/auth/sessionTypes';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authToken = getCookie('authToken');
        const refreshToken = getCookie('refreshToken');

        if (!validateAuthToken(authToken)) {
          clearSessionStorage();
          dispatch(logout());
          dispatch(setSessionBootstrapped(true));
          return;
        }

        let session: SessionMeta | undefined;
        const sessionRaw = getCookie('sessionInfo');
        if (sessionRaw) {
          try {
            session = JSON.parse(sessionRaw) as SessionMeta;
          } catch {
            session = undefined;
          }
        }

        const roleCookie = getCookie('userRole');
        const role =
          roleCookie === 'teacher' || roleCookie === 'admin' || roleCookie === 'user'
            ? roleCookie
            : undefined;

        dispatch(
          loginSuccess({
            token: authToken ?? undefined,
            refreshToken: refreshToken || '',
            session,
            ...(role
              ? { role, accountTypeId: accountTypeIdFromRole(role) }
              : {}),
          }),
        );

        const onRefresh = async () => {
          const newToken = getCookie('authToken');
          const newRefresh = getCookie('refreshToken');
          let latestSession: SessionMeta | undefined;
          const raw = getCookie('sessionInfo');
          if (raw) {
            try {
              latestSession = JSON.parse(raw) as SessionMeta;
            } catch {
              latestSession = undefined;
            }
          }
          if (newToken) {
            dispatch(
              updateSessionTokens({
                token: newToken,
                refreshToken: newRefresh || undefined,
                session: latestSession,
              }),
            );
          }
          return Boolean(newToken);
        };

        if (refreshToken && isAccessTokenExpired()) {
          await refreshAccessToken(onRefresh);
        }

        await fetchSessionInfo();
        const profileResult = (await dispatch(getProfileInfo() as never)) as {
          unauthenticated?: boolean;
        } | null;
        if (profileResult && typeof profileResult === 'object' && profileResult.unauthenticated) {
          clearSessionStorage();
          dispatch(logout());
          dispatch(setSessionBootstrapped(true));
          return;
        }
        startSessionManager(onRefresh);
      } catch {
        clearSessionStorage();
        dispatch(logout());
      } finally {
        dispatch(setSessionBootstrapped(true));
      }
    };

    void checkAuth();
  }, [dispatch]);

  return <>{children}</>;
}
