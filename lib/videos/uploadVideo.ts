import { ensureValidAccessToken, getAuthToken } from '@/lib/auth/authenticatedFetch';
import { MAX_THUMBNAIL_BYTES, MAX_THUMBNAIL_LABEL, MAX_VIDEO_BYTES, MAX_VIDEO_LABEL } from './constants';

export type UploadVideoPayload = {
  file: File;
  thumbnail: File;
  title: string;
  description: string;
  mood: string;
  section: string;
  durationSeconds?: number;
};

export type UploadVideoResult = {
  message?: string;
  video?: unknown;
  error?: string;
};

/**
 * Upload directly to Express when NEXT_PUBLIC_BACKEND_URL is set.
 * Skips the Next.js BFF so large files (up to 2 GB) are not buffered twice.
 */
export async function uploadVideo(
  payload: UploadVideoPayload,
  onProgress?: (percent: number) => void,
): Promise<UploadVideoResult> {
  if (payload.file.size > MAX_VIDEO_BYTES) {
    return { error: `Video must be ${MAX_VIDEO_LABEL} or smaller.` };
  }
  if (payload.thumbnail.size > MAX_THUMBNAIL_BYTES) {
    return { error: `Thumbnail must be ${MAX_THUMBNAIL_LABEL} or smaller.` };
  }

  await ensureValidAccessToken();
  const token = getAuthToken();
  if (!token) {
    return { error: 'Authentication required' };
  }

  const formData = new FormData();
  formData.append('video', payload.file);
  formData.append('thumbnail', payload.thumbnail);
  formData.append('title', payload.title);
  formData.append('description', payload.description);
  formData.append('mood', payload.mood);
  formData.append('section', payload.section);
  if (payload.durationSeconds && payload.durationSeconds > 0) {
    formData.append('durationSeconds', String(Math.round(payload.durationSeconds)));
  }

  const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
  const url = backendBase
    ? `${backendBase}/api/videos/upload`
    : '/api/videos/upload';

  if (backendBase && typeof XMLHttpRequest !== 'undefined') {
    return uploadWithProgress(url, formData, token, onProgress);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: backendBase ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
    credentials: backendBase ? 'omit' : 'include',
  });

  const data = (await res.json()) as UploadVideoResult;
  if (!res.ok) {
    return { error: data.error || (data as { message?: string }).message || 'Upload failed' };
  }
  onProgress?.(100);
  return data;
}

function uploadWithProgress(
  url: string,
  formData: FormData,
  token: string,
  onProgress?: (percent: number) => void,
): Promise<UploadVideoResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || '{}') as UploadVideoResult;
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100);
          resolve(data);
        } else {
          resolve({
            error: data.error || (data as { message?: string }).message || 'Upload failed',
          });
        }
      } catch {
        resolve({ error: 'Invalid response from server' });
      }
    };

    xhr.onerror = () => resolve({ error: 'Network error during upload' });
    xhr.send(formData);
  });
}
