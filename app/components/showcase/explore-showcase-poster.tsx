'use client';

import { useEffect, useState } from 'react';
import { formatDuration } from '@/lib/videos/formatDuration';
import { getVideoDurationFromUrl } from '@/lib/videos/videoMetadata';
import { useTranslations } from '@/lib/i18n/locale-context';
import { ShowcasePoster, type ShowcaseBadge } from './showcase-poster';

export interface ExploreClipLike {
  id: string;
  source: 'youtube' | 'upload';
  videoUrl?: string;
  youtubeId?: string;
  mimeType?: string;
  title: string;
  description: string;
  mood: string;
  likes: number;
  durationSeconds: number;
  premium: boolean;
  previewSec: number;
  author?: string;
  aiTranslated?: boolean;
}

interface ExploreShowcasePosterProps {
  clip: ExploreClipLike;
  thumbnailUrl: string;
  onOpen: (clip: ExploreClipLike) => void;
  isActiveInViewer: boolean;
  hasFullAccess: boolean;
}

export function ExploreShowcasePoster({
  clip,
  thumbnailUrl,
  onOpen,
  isActiveInViewer,
  hasFullAccess,
}: ExploreShowcasePosterProps) {
  const { t } = useTranslations();
  const [displaySeconds, setDisplaySeconds] = useState(clip.durationSeconds);

  useEffect(() => {
    setDisplaySeconds(clip.durationSeconds);
  }, [clip.durationSeconds, clip.id]);

  useEffect(() => {
    if (clip.source !== 'upload' || !clip.videoUrl || clip.durationSeconds > 0) return;
    let cancelled = false;
    void getVideoDurationFromUrl(clip.videoUrl).then((sec) => {
      if (!cancelled && sec > 0) setDisplaySeconds(sec);
    });
    return () => {
      cancelled = true;
    };
  }, [clip.source, clip.videoUrl, clip.durationSeconds]);

  const badges: ShowcaseBadge[] = [];
  if (hasFullAccess) badges.push('full');
  else badges.push('preview');
  if (clip.premium) badges.push('premium');
  if (clip.aiTranslated) badges.push('translated');

  return (
    <ShowcasePoster
      title={clip.title}
      thumbnailUrl={thumbnailUrl || undefined}
      durationLabel={formatDuration(displaySeconds) || undefined}
      moodLabel={clip.mood}
      meta={t('explore.byAuthor', { author: clip.author || 'Ariome' })}
      badges={badges}
      badgeLabels={{
        full: t('explore.fullAccess'),
        preview: t('explore.freePreview'),
        premium: t('explore.premium'),
        translated: t('explore.aiTranslated'),
      }}
      isActive={isActiveInViewer}
      onClick={() => onOpen(clip)}
      previewVideoUrl={clip.source === 'upload' ? clip.videoUrl : undefined}
      previewYoutubeId={clip.source === 'youtube' ? clip.youtubeId : undefined}
    />
  );
}
