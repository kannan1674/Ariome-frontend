'use client';

import { Activity, Clock, History } from 'lucide-react';
import { HomeEventCard } from './home-event-card';
import type { ReactNode } from 'react';

type EventSectionProps = {
  title: string;
  icon: ReactNode;
  accentClass: string;
  events: Record<string, unknown>[];
  variant: 'ongoing' | 'upcoming' | 'past';
};

function EventSection({ title, icon, accentClass, events, variant }: EventSectionProps) {
  if (events.length === 0) return null;

  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <span className={`flex size-9 items-center justify-center rounded-xl ${accentClass}`}>{icon}</span>
        <div>
          <h2 className="text-lg font-semibold text-[var(--ariome-text)] sm:text-xl">{title}</h2>
          <p className="text-xs text-[var(--ariome-text-faint)]">{events.length} event{events.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map((event) => (
          <HomeEventCard
            key={String(event.id || event.apiId || event.Id)}
            event={event}
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
}

type HomeEventsSectionProps = {
  ongoing: Record<string, unknown>[];
  upcoming: Record<string, unknown>[];
  past: Record<string, unknown>[];
};

export function HomeEventsSection({ ongoing, upcoming, past }: HomeEventsSectionProps) {
  const total = ongoing.length + upcoming.length + past.length;
  if (total === 0) return null;

  return (
    <div className="space-y-10 border-t border-[var(--ariome-border)] pt-10">
      <div>
        <p className="ariome-label">Community</p>
        <h2 className="ariome-display mt-2 text-xl font-semibold text-[var(--ariome-text)] sm:text-2xl">
          Events & gatherings
        </h2>
        <p className="mt-1 text-sm text-[var(--ariome-text-muted)]">Join live sessions and community experiences</p>
      </div>

      <EventSection
        title="Active now"
        icon={<Activity className="size-4 text-white" />}
        accentClass="bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-400/30"
        events={ongoing}
        variant="ongoing"
      />
      <EventSection
        title="Coming up"
        icon={<Clock className="size-4 text-white" />}
        accentClass="bg-violet-500/25 text-violet-300 ring-1 ring-violet-400/30"
        events={upcoming}
        variant="upcoming"
      />
      <EventSection
        title="Past events"
        icon={<History className="size-4 text-white" />}
        accentClass="bg-white/10 text-white/70 ring-1 ring-white/15"
        events={past}
        variant="past"
      />
    </div>
  );
}
