import { authenticatedFetch, ensureValidAccessToken, getAuthToken } from '@/lib/auth/authenticatedFetch';
import type { AiClip, ReflectionCardInsight, ShortScript } from './types';

async function contentPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  await ensureValidAccessToken();
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in again to use this feature.');
  }

  const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
  const url = backendBase ? `${backendBase}/api/content/${path}` : `/api/content/${path}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    credentials: backendBase ? 'omit' : 'include',
  });

  const data = (await res.json()) as T & { error?: string; message?: string };
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(data.message || data.error || 'Please sign in again to use this feature.');
    }
    throw new Error(data.message || data.error || 'Request failed');
  }
  return data;
}

export async function fetchAiClips(mood: string, interests?: string) {
  return contentPost<{ clips?: AiClip[] }>('ai-clips', { mood, interests });
}

export async function fetchReflectionCard(body: string, moodBefore: string, moodAfter: string) {
  return contentPost<ReflectionCardInsight>('reflection-card', { body, moodBefore, moodAfter });
}

export async function fetchJournalPrompts(mood: string, theme?: string) {
  return contentPost<{ prompts?: string[] }>('journal-prompts', { mood, theme });
}

export async function fetchShortVideoVoice(text: string) {
  return contentPost<{
    audioBase64?: string;
    mimeType?: string;
    hasVoice?: boolean;
  }>('short-video-voice', { text });
}

export async function fetchShortsScripts(topic: string, mood: string, count = 3) {
  return contentPost<{ shorts?: ShortScript[] }>('shorts', { topic, mood, count });
}
