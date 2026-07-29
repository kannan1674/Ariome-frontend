'use client';

import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { eventInfoGet } from '@/lib/Actions/HomeActions';
import { cn } from '@/lib/utils';

type HomeEventCardProps = {
  event: Record<string, unknown>;
  variant?: 'ongoing' | 'upcoming' | 'past';
};

const VARIANT_STYLES = {
  ongoing: 'ring-emerald-500/30',
  upcoming: 'ring-violet-500/30',
  past: 'ring-white/10 opacity-90',
} as const;

export function HomeEventCard({ event, variant = 'upcoming' }: HomeEventCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const clubId = process.env.NEXT_PUBLIC_CLUB_ID || '';
  const eventId = String(event.apiId || event.Id || '');
  const title = String(event.title || event.Name || 'Event');
  const image = (event.image || event.ImagePath) as string | undefined;
  const dateText =
    [event.StartDateText || event.StartDateString, event.EndDateText || event.EndDateString]
      .filter(Boolean)
      .join(' – ') || 'Date TBD';

  const handleClick = () => {
    if (eventId) dispatch(eventInfoGet(eventId, clubId));
  };

  return (
    <Link
      href={`/home-details?eventId=${encodeURIComponent(eventId)}`}
      onClick={handleClick}
      className={cn(
        'group flex flex-col overflow-hidden rounded-[var(--ariome-radius-lg)] border border-[var(--ariome-border)] bg-[var(--ariome-surface)] ring-1 transition hover:border-[var(--ariome-border-strong)] hover:bg-[var(--ariome-surface-hover)]',
        VARIANT_STYLES[variant],
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--ariome-bg-elevated)]">
        {image ? (
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-teal-900/30">
            <Calendar className="size-8 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--ariome-text)] group-hover:text-[var(--ariome-gold-soft)] sm:text-base">
          {title}
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--ariome-text-faint)]">
          <Calendar className="size-3.5 shrink-0" />
          {dateText}
        </p>
        {Boolean(event.MinimumPrice) && !event.RegistrationClosed ? (
          <p className="mt-2 text-xs font-medium text-[var(--ariome-violet)]">From ₹{String(event.MinimumPrice)}</p>
        ) : null}
        {Boolean(event.RegistrationClosed) ? (
          <p className="mt-2 text-xs font-medium text-red-400/90">Registration closed</p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold text-[var(--ariome-gold)]">
          View details
          <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
