import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/locales';
import type { VideoSubtitleTrack } from './types';

function backendBase(): string {
  return (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
}

/** Subtitle URLs for a video when the API omits subtitleTracks. */
export function buildDefaultSubtitleTracks(videoId: string): VideoSubtitleTrack[] {
  const base = backendBase();
  return SUPPORTED_LOCALES.map((locale) => ({
    language: locale,
    label: LOCALE_LABELS[locale as Locale],
    url: `${base}/uploads/subtitles/${videoId}-${locale}.vtt`,
    default: locale === 'en',
  }));
}

export function resolveSubtitleTracks(
  videoId: string,
  tracks?: VideoSubtitleTrack[],
): VideoSubtitleTrack[] {
  if (tracks && tracks.length > 0) return tracks;
  if (!videoId) return [];
  return buildDefaultSubtitleTracks(videoId);
}
