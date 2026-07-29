import { authenticatedFetch } from '@/lib/auth/authenticatedFetch';

const recordedInSession = new Set<string>();

/** Record one view per video per browser session (Explore playback). */
export async function recordVideoView(videoId: string): Promise<void> {
  if (!videoId || recordedInSession.has(videoId)) return;
  recordedInSession.add(videoId);

  try {
    const res = await authenticatedFetch(`/api/videos/${videoId}/view`, {
      method: 'POST',
    });
    if (!res.ok) {
      recordedInSession.delete(videoId);
    }
  } catch {
    recordedInSession.delete(videoId);
  }
}

export function uploadClipVideoId(clipId: string): string | null {
  if (!clipId.startsWith('upload-')) return null;
  return clipId.slice('upload-'.length);
}
