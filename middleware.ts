import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Case-variant URLs only. Do not match `/explore` — `next.config` redirects
 * were matching case-insensitively and caused ERR_TOO_MANY_REDIRECTS.
 */
function homeForRole(role: string | undefined) {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher';
  return '/home';
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === '/Explore' || path === '/EXPLORE') {
    return NextResponse.redirect(new URL('/explore', request.url));
  }

  if (path === '/') {
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    const dest = homeForRole(request.cookies.get('userRole')?.value);
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/Explore', '/EXPLORE'],
};
