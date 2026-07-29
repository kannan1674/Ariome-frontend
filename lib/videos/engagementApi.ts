import { authenticatedFetch } from '@/lib/auth/authenticatedFetch';
import type { TeacherFeedback, VideoEngagement } from './engagementTypes';

export async function fetchVideoEngagement(videoId: string): Promise<VideoEngagement | null> {
  const res = await authenticatedFetch(`/api/videos/${videoId}/engagement`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return (await res.json()) as VideoEngagement;
}

export async function toggleVideoLike(
  videoId: string,
): Promise<{ liked: boolean; likeCount: number } | null> {
  const res = await authenticatedFetch(`/api/videos/${videoId}/like`, {
    method: 'POST',
  });
  if (!res.ok) return null;
  return (await res.json()) as { liked: boolean; likeCount: number };
}

export async function postVideoComment(
  videoId: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await authenticatedFetch(`/api/videos/${videoId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = (await res.json()) as { message?: string; error?: string };
  if (!res.ok) {
    return { ok: false, error: data.error || data.message || 'Could not post comment' };
  }
  return { ok: true };
}

export async function fetchTeacherFeedback(): Promise<TeacherFeedback | null> {
  const res = await authenticatedFetch('/api/videos/mine/feedback', {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return (await res.json()) as TeacherFeedback;
}

export function formatEngagementDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
