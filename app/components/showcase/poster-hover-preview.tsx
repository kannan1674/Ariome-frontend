'use client';

import { cn } from '@/lib/utils';

type PosterHoverPreviewProps = {
  active: boolean;
  videoUrl?: string;
  youtubeId?: string;
  title: string;
  className?: string;
};

export function PosterHoverPreview({
  active,
  videoUrl,
  youtubeId,
  title,
  className,
}: PosterHoverPreviewProps) {
  if (!active) return null;

  if (youtubeId) {
    return (
      <iframe
        title={`Preview: ${title}`}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&iv_load_policy=3&rel=0&loop=1&playlist=${youtubeId}`}
        className={cn('pointer-events-none absolute inset-0 h-full w-full border-0', className)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    );
  }

  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={cn('pointer-events-none absolute inset-0 h-full w-full object-cover', className)}
        aria-hidden
      />
    );
  }

  return null;
}
