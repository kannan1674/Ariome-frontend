'use client';

import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { useCanHover } from '@/lib/hooks/use-can-hover';
import { cn } from '@/lib/utils';
import { PosterHoverPreview } from './poster-hover-preview';

export type ShowcaseBadge = 'preview' | 'premium' | 'full' | 'translated';

export interface ShowcasePosterProps {
  title: string;
  thumbnailUrl?: string;
  fallbackGradient?: string;
  durationLabel?: string;
  moodLabel?: string;
  meta?: string;
  badges?: ShowcaseBadge[];
  badgeLabels?: Partial<Record<ShowcaseBadge, string>>;
  isActive?: boolean;
  onClick: () => void;
  /** Muted preview on hover (desktop). */
  previewVideoUrl?: string;
  previewYoutubeId?: string;
  className?: string;
}

const DEFAULT_GRADIENT =
  'bg-gradient-to-br from-purple-200 via-violet-100 to-teal-100';

const HOVER_PREVIEW_DELAY_MS = 400;

export function ShowcasePoster({
  title,
  thumbnailUrl,
  fallbackGradient = DEFAULT_GRADIENT,
  durationLabel,
  moodLabel,
  meta,
  badges = [],
  badgeLabels,
  isActive,
  onClick,
  previewVideoUrl,
  previewYoutubeId,
  className,
}: ShowcasePosterProps) {
  const canHover = useCanHover();
  const hasPreview = Boolean(previewVideoUrl || previewYoutubeId);
  const [hovering, setHovering] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);

  useEffect(() => {
    setThumbFailed(false);
  }, [thumbnailUrl]);

  useEffect(() => {
    if (!hovering || !canHover || !hasPreview) {
      setShowPreview(false);
      return;
    }
    const t = window.setTimeout(() => setShowPreview(true), HOVER_PREVIEW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [hovering, canHover, hasPreview]);

  return (
    <article
      className={cn(
        'group relative w-[11.5rem] shrink-0 snap-start sm:w-[13.5rem] md:w-[15rem] lg:w-[16.5rem]',
        className,
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'relative block w-full overflow-hidden rounded-[var(--ariome-radius-lg)] text-left outline-none transition duration-300 ease-out',
          'focus-visible:ring-2 focus-visible:ring-[var(--ariome-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ariome-bg)]',
          'hover:z-20 hover:scale-[1.06] hover:shadow-[var(--ariome-shadow)]',
          isActive && 'ring-2 ring-[var(--ariome-gold)] shadow-[0_0_24px_var(--ariome-gold-muted)]',
        )}
        aria-label={`Play ${title}`}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 ring-1 ring-[var(--ariome-border)]">
          {thumbnailUrl && !thumbFailed ? (
            <img
              src={thumbnailUrl}
              alt=""
              onError={() => setThumbFailed(true)}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition duration-300',
                showPreview ? 'opacity-0' : 'opacity-100 group-hover:scale-105',
              )}
            />
          ) : (
            <div className={cn('absolute inset-0 flex items-center justify-center', fallbackGradient)} aria-hidden>
              <Play className="size-8 text-purple-400/60" strokeWidth={1.5} />
            </div>
          )}

          <PosterHoverPreview
            active={showPreview}
            videoUrl={previewVideoUrl}
            youtubeId={previewYoutubeId}
            title={title}
          />

          <div
            className={cn(
              'pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-opacity',
              showPreview ? 'opacity-50' : 'opacity-100',
            )}
          />

          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {badges.includes('full') && (
              <span className="rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                {badgeLabels?.full ?? 'Full'}
              </span>
            )}
            {badges.includes('preview') && (
              <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                {badgeLabels?.preview ?? 'Preview'}
              </span>
            )}
            {badges.includes('premium') && (
              <span className="rounded-md bg-[var(--ariome-gold)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1a1510]">
                {badgeLabels?.premium ?? 'Premium'}
              </span>
            )}
            {badges.includes('translated') && (
              <span className="rounded-md bg-sky-500/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                {badgeLabels?.translated ?? 'Translated'}
              </span>
            )}
          </div>

          {durationLabel ? (
            <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white/95">
              {durationLabel}
            </span>
          ) : null}

          <span
            className={cn(
              'absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--ariome-gold-soft)] text-[#1a1510] shadow-lg transition duration-300 sm:size-12',
              showPreview ? 'scale-90 opacity-0' : 'opacity-0 group-hover:opacity-100',
            )}
          >
            <Play className="ml-0.5 size-5 fill-current sm:size-6" />
          </span>
        </div>

        <div className="mt-2 space-y-1 px-0.5">
          {moodLabel ? (
            <p className="ariome-label text-[10px] tracking-[0.22em]">
              {moodLabel}
            </p>
          ) : null}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--ariome-text)]">{title}</h3>
          {meta ? <p className="line-clamp-1 text-xs text-[var(--ariome-text-muted)]">{meta}</p> : null}
        </div>
      </button>
    </article>
  );
}
