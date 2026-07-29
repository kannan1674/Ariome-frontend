import {
  authenticatedFetch,
  ensureValidAccessToken,
  getAuthToken,
  isAuthExpiredResponse,
} from '@/lib/auth/authenticatedFetch';
import { refreshAccessToken } from '@/lib/auth/sessionManager';
import type { TeacherVideo } from './types';

export type VideoMood =
  | 'Peaceful'
  | 'Grateful'
  | 'Hopeful'
  | 'Joyful'
  | 'Reflective'
  | 'Anxious';

export type VideoFormPayload = {
  title: string;
  description: string;
  mood: VideoMood;
  section: 'wisdom' | 'practices';
};

export async function fetchMyVideos(): Promise<TeacherVideo[]> {
  const res = await authenticatedFetch('/api/videos?mine=true', {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { videos?: TeacherVideo[] };
  return data.videos || [];
}

export async function updateVideo(
  id: string,
  payload: VideoFormPayload,
  thumbnail?: File | null,
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', payload.description);
  formData.append('mood', payload.mood);
  formData.append('section', payload.section);
  if (thumbnail) {
    formData.append('thumbnail', thumbnail);
  }

  await ensureValidAccessToken();

  const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
  const url = backendBase ? `${backendBase}/api/videos/${id}` : `/api/videos/${id}`;

  const token = getAuthToken();
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  let res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: formData,
    credentials: backendBase ? 'omit' : 'include',
  });

  if (res.status === 401) {
    const body = await res.clone().json().catch(() => ({}));
    if (isAuthExpiredResponse(401, body) && (await refreshAccessToken())) {
      const newToken = getAuthToken();
      res = await fetch(url, {
        method: 'PATCH',
        headers: newToken ? { Authorization: `Bearer ${newToken}` } : {},
        body: formData,
        credentials: backendBase ? 'omit' : 'include',
      });
    }
  }

  const data = (await res.json()) as { message?: string; error?: string };
  if (!res.ok) {
    return { ok: false, error: data.error || data.message || 'Update failed' };
  }
  return { ok: true, message: data.message };
}

export async function retryVideoTranscription(
  id: string,
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const res = await authenticatedFetch(`/api/videos/${id}/transcribe`, {
    method: 'POST',
  });
  const data = (await res.json()) as { message?: string; error?: string };
  if (!res.ok) {
    return { ok: false, error: data.error || data.message || 'Could not start captions' };
  }
  return { ok: true, message: data.message };
}

export async function deleteVideo(
  id: string,
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const res = await authenticatedFetch(`/api/videos/${id}`, {
    method: 'DELETE',
  });
  const data = (await res.json()) as { message?: string; error?: string };
  if (!res.ok) {
    return { ok: false, error: data.error || data.message || 'Delete failed' };
  }
  return { ok: true, message: data.message };
}

export function formatVideoSize(bytes?: number) {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatVideoDate(iso: string) {
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
