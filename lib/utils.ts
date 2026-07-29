import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NextResponse } from 'next/server';

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

/**
 * Create a secure API response without cookies
 */
export function createSecureResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Set-Cookie': '', // Explicitly prevent cookies
    }
  });
}

/**
 * Create a secure error response without cookies
 */
export function createSecureErrorResponse(error: string, status: number = 500) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Set-Cookie': '', // Explicitly prevent cookies
      }
    }
  );
}

/**
 * Extract authentication token from request body (hidden from network tab)
 */
export function extractAuthToken(body: any): { token: string | null; cleanBody: any } {
  if (!body || typeof body !== 'object') {
    return { token: null, cleanBody: body };
  }

  const { _authToken, ...cleanBody } = body;
  return { 
    token: _authToken || null, 
    cleanBody: Object.keys(cleanBody).length > 0 ? cleanBody : undefined 
  };
}

/**
 * Validate authentication token
 */
export function validateAuthToken(token: string | null): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  const trimmed = token.trim().toLowerCase();
  if (trimmed === 'undefined' || trimmed === 'null' || trimmed === '') {
    return false;
  }
  return true;
}

// Dummy fingerprint function (replace with your real implementation)
export async function getBrowserFingerprint(): Promise<string> {
  return 'dummy-fingerprint';
}
