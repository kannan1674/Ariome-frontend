// Token storage utilities for localStorage

import {
  canUseLocalStorage,
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from './safeStorage';

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const SESSION_ID_KEY = 'sessionId';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const ACCOUNT_TYPE_ID_KEY = 'AccountTypeId';
const CSRF_TOKEN_KEY = 'csrf-token';
const COOKIE_TOKEN_KEYS = ['authToken', 'authtoken', 'authtokaen'];

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const escapedName = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const getTokenFromCookies = (): string | null => {
  for (const key of COOKIE_TOKEN_KEYS) {
    const value = getCookieValue(key);
    if (value) {
      return value;
    }
  }
  return null;
};

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
  return getLocalStorageItem(TOKEN_KEY);
};

/**
 * Set token in localStorage
 */
export const setToken = (token: string): void => {
  setLocalStorageItem(TOKEN_KEY, token);
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  removeLocalStorageItem(TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return getLocalStorageItem(REFRESH_TOKEN_KEY);
};

/**
 * Set refresh token in localStorage
 */
export const setRefreshToken = (token: string): void => {
  setLocalStorageItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Remove refresh token from localStorage
 */
export const removeRefreshToken = (): void => {
  removeLocalStorageItem(REFRESH_TOKEN_KEY);
};

/**
 * Get session ID from localStorage
 */
export const getSessionId = (): string | null => {
  return getLocalStorageItem(SESSION_ID_KEY);
};

/**
 * Set session ID in localStorage
 */
export const setSessionId = (sessionId: string): void => {
  setLocalStorageItem(SESSION_ID_KEY, sessionId);
};

/**
 * Remove session ID from localStorage
 */
export const removeSessionId = (): void => {
  removeLocalStorageItem(SESSION_ID_KEY);
};

/**
 * Get token expiry from localStorage
 */
export const getTokenExpiry = (): number | null => {
  const expiry = getLocalStorageItem(TOKEN_EXPIRY_KEY);
  return expiry ? parseInt(expiry, 10) : null;
};

/**
 * Set token expiry in localStorage
 */
export const setTokenExpiry = (expiry: number): void => {
  setLocalStorageItem(TOKEN_EXPIRY_KEY, expiry.toString());
};

/**
 * Remove token expiry from localStorage
 */
export const removeTokenExpiry = (): void => {
  removeLocalStorageItem(TOKEN_EXPIRY_KEY);
};

/**
 * Get account type ID from localStorage
 */
export const getAccountTypeId = (): string | null => {
  return getLocalStorageItem(ACCOUNT_TYPE_ID_KEY);
};

/**
 * Set account type ID in localStorage
 */
export const setAccountTypeId = (accountTypeId: string): void => {
  setLocalStorageItem(ACCOUNT_TYPE_ID_KEY, accountTypeId);
};

/**
 * Remove account type ID from localStorage
 */
export const removeAccountTypeId = (): void => {
  removeLocalStorageItem(ACCOUNT_TYPE_ID_KEY);
};

/**
 * Get CSRF token from localStorage
 */
export const getCsrfToken = (): string | null => {
  return getLocalStorageItem(CSRF_TOKEN_KEY);
};

/**
 * Set CSRF token in localStorage
 */
export const setCsrfToken = (token: string): void => {
  setLocalStorageItem(CSRF_TOKEN_KEY, token);
};

/**
 * Remove CSRF token from localStorage
 */
export const removeCsrfToken = (): void => {
  removeLocalStorageItem(CSRF_TOKEN_KEY);
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (): boolean => {
  const expiry = getTokenExpiry();
  if (!expiry) return true;
  return Date.now() > expiry;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (token && !isTokenExpired()) {
    return true;
  }

  const cookieToken = getTokenFromCookies();
  return !!cookieToken;
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = (): void => {
  if (!canUseLocalStorage()) return;
  removeToken();
  removeRefreshToken();
  removeSessionId();
  removeTokenExpiry();
  removeAccountTypeId();
  removeCsrfToken();
};

/**
 * Set all authentication data in localStorage
 */
export const setAuthData = (data: {
  token: string;
  refreshToken: string;
  sessionId: string;
  expiresIn: number;
  accountTypeId?: string;
  csrfToken?: string;
}): void => {
  setToken(data.token);
  setRefreshToken(data.refreshToken);
  setSessionId(data.sessionId);
  setTokenExpiry(Date.now() + (data.expiresIn * 1000));
  
  if (data.accountTypeId) {
    setAccountTypeId(data.accountTypeId);
  }
  
  if (data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }
};

/**
 * Get all authentication data from localStorage
 */
export const getAuthData = (): {
  token: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  accountTypeId: string | null;
  csrfToken: string | null;
  isExpired: boolean;
} => {
  return {
    token: getToken(),
    refreshToken: getRefreshToken(),
    sessionId: getSessionId(),
    accountTypeId: getAccountTypeId(),
    csrfToken: getCsrfToken(),
    isExpired: isTokenExpired(),
  };
};
