import { authenticatedFetch } from '@/lib/auth/authenticatedFetch';
import type { TeacherVideo } from '@/lib/videos/types';
import type { AdminDashboard, AdminUser } from './types';

export async function fetchDashboard(): Promise<AdminDashboard | null> {
  const res = await authenticatedFetch('/api/admin/stats', {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return (await res.json()) as AdminDashboard;
}

export async function fetchUsers(): Promise<AdminUser[]> {
  const res = await authenticatedFetch('/api/admin/users', {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { users?: AdminUser[] };
  return data.users || [];
}

/** @deprecated Use fetchUsers */
export async function fetchTeachers(): Promise<AdminUser[]> {
  return fetchUsers();
}

export async function fetchAllVideos(): Promise<TeacherVideo[]> {
  const res = await authenticatedFetch('/api/videos?limit=100', {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { videos?: TeacherVideo[] };
  return data.videos || [];
}

export function formatUserDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** @deprecated Use formatUserDate */
export const formatTeacherDate = formatUserDate;
