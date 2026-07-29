// Synchronous version for client-side usage
export function getCookie(name: string): string | null {
  // Client-side cookie access
  if (typeof document !== 'undefined') {
        // More robust cookie parsing that handles special characters
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const cookieName = trimmed.slice(0, eq);
      if (cookieName === name) {
        const cookieValue = trimmed.slice(eq + 1);
        return cookieValue ? decodeURIComponent(cookieValue) : null;
      }
    }
    
    return null;
  }

  // Server-side: return null for synchronous version
  return null;
}

// Asynchronous version for server-side usage
export async function getCookieAsync(name: string): Promise<string | null> {
  // Client-side cookie access
  if (typeof document !== 'undefined') {
    // More robust cookie parsing that handles special characters
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const cookieName = trimmed.slice(0, eq);
      if (cookieName === name) {
        const cookieValue = trimmed.slice(eq + 1);
        return cookieValue ? decodeURIComponent(cookieValue) : null;
      }
    }
    return null;
  }

  // Server-side cookie access using Next.js headers API (if available)
  try {
    const { cookies } = await import('next/headers');
    const cookie = (await cookies()).get(name);
    const value = cookie ? cookie.value : null;
    return value;
  } catch {
    return null;
  }
}

export function getCsrfToken(): string | null {
  return getCookie('csrf-token');
}

export async function getCsrfTokenAsync(): Promise<string | null> {
  return await getCookieAsync('csrf-token');
}

export function setCookie(
  name: string,
  value: string,
  options: { maxAgeSeconds?: number; path?: string } = {},
): void {
  if (typeof document === 'undefined') return;
  
  let cookie = `${name}=${encodeURIComponent(value)}`;
  
  if (options.maxAgeSeconds) {
    cookie += `; Max-Age=${options.maxAgeSeconds}`;
  }
  
  cookie += `; Path=${options.path || '/'}`;
  cookie += `; SameSite=Lax`; // Allow cross-site requests

  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    cookie += `; Secure`; // Secure only on HTTPS
  }

    document.cookie = cookie;
}

export function deleteCookie(name: string): void {
  setCookie(name, '', { maxAgeSeconds: 0 });
}

// Debug function to list all cookies
export function listAllCookies(): void {
  if (typeof document === 'undefined') return;
  

    const cookies = document.cookie.split(';');
  cookies.forEach(() => {
    // Iterate over cookies (destructured values not used in this debug function)
  });
}
