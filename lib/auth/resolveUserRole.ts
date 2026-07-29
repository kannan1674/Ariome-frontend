export type AppRole = 'user' | 'teacher' | 'admin';

export function accountTypeIdFromRole(role: AppRole): number {
  if (role === 'admin') return 3;
  if (role === 'teacher') return 2;
  return 1;
}

export function resolveUserRole(
  user: { role?: string; accountTypeId?: number } | null | undefined,
): AppRole {
  if (!user) return 'user';
  if (user.role === 'teacher' || user.role === 'admin' || user.role === 'user') {
    return user.role;
  }
  if (user.accountTypeId === 3) return 'admin';
  if (user.accountTypeId === 2) return 'teacher';
  return 'user';
}

export function isAdmin(role: AppRole) {
  return role === 'admin';
}

export function isTeacher(role: AppRole) {
  return role === 'teacher';
}

export function isTeacherOrAdmin(role: AppRole) {
  return role === 'teacher' || role === 'admin';
}

/** Paths reserved for a specific role's dashboard (not valid cross-role returnUrl targets). */
export function isRoleScopedPath(path: string, role: AppRole): boolean {
  if (role === 'admin') return path.startsWith('/admin');
  if (role === 'teacher') return path.startsWith('/teacher');
  return false;
}

export function getDefaultPathForRole(role: AppRole): string {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher';
  return '/home';
}
