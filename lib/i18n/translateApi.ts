import type { Locale } from './locales';
import { authenticatedFetch } from '@/lib/auth/authenticatedFetch';

export type TranslateResult = {
  text: string;
  translatedText: string;
  sourceLocale: string;
  targetLocale: string;
  provider: string;
};

export async function translateText(
  text: string,
  targetLocale: Locale,
  sourceLocale: Locale = 'en',
): Promise<TranslateResult> {
  const res = await authenticatedFetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLocale, sourceLocale }),
  });
  const data = (await res.json()) as TranslateResult & { error?: string; message?: string };
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Translation failed');
  }
  return data;
}
