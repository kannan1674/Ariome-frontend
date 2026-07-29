'use client';

import { Info, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ShowcaseHeroProps {
  title: string;
  description: string;
  thumbnailUrl?: string;
  moodLabel?: string;
  meta?: string;
  durationLabel?: string;
  onPlay: () => void;
  onMoreInfo?: () => void;
  playLabel?: string;
  moreInfoLabel?: string;
  previewVideoUrl?: string;
  previewYoutubeId?: string;
  className?: string;
}

export function ShowcaseHero({
  title,
  description,
  thumbnailUrl,
  moodLabel,
  meta,
  durationLabel,
  onPlay,
  onMoreInfo,
  playLabel = 'Watch now',
  moreInfoLabel = 'Details',
  className,
}: ShowcaseHeroProps) {
  return (
    <section
      className={cn(
        'group relative min-h-[min(52vh,420px)] overflow-hidden rounded-[var(--ariome-radius-xl)] border border-[var(--ariome-border)] shadow-[var(--ariome-shadow)] sm:min-h-[min(56vh,460px)]',
        className,
      )}
    >
      {/* Full-card cover image */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-200 via-violet-100 to-teal-100"
          aria-hidden
        />
      )}

      {/* Light bottom edge only — keeps image clear */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />

      <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl space-y-4 rounded-[var(--ariome-radius-lg)] border border-white/40 bg-white/85 p-5 shadow-lg backdrop-blur-md sm:p-6">
          {moodLabel ? <p className="ariome-label">{moodLabel}</p> : null}
          <h1 className="ariome-display text-2xl font-semibold leading-tight text-[var(--ariome-text)] sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="line-clamp-3 max-w-xl text-sm leading-relaxed text-[var(--ariome-text-muted)] sm:text-base">
            {description}
          </p>
          {(meta || durationLabel) && (
            <p className="text-xs text-[var(--ariome-text-faint)]">
              {[meta, durationLabel].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="button" onClick={onPlay} className="ariome-btn-primary h-11 rounded-full px-7 text-sm">
              <Play className="mr-2 size-4 fill-current" />
              {playLabel}
            </Button>
            {onMoreInfo ? (
              <Button
                type="button"
                variant="outline"
                onClick={onMoreInfo}
                className="ariome-btn-ghost h-11 rounded-full px-7 text-sm font-medium"
              >
                <Info className="mr-2 size-4" />
                {moreInfoLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
