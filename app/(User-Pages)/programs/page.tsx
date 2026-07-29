'use client';

import Demo7Layout from '@/app/components/layouts/demo7/layout';
import ProgramsHub from '@/app/components/learning/programs-hub';
import { StreamingPageHeader, StreamingShell } from '@/app/components/streaming';
import { GraduationCap } from 'lucide-react';

export default function ProgramsPage() {
  return (
    <Demo7Layout>
      <StreamingShell activeNav="practice" className="pt-2 md:pb-8">
        <StreamingPageHeader
          brand="Ariome"
          title="Learn"
          subtitle="Multi-day programs, creator courses, habit journeys & certificates"
          backHref="/practice"
          backLabel="← Practice"
          center
          trailing={
            <span className="flex size-10 shrink-0 items-center justify-center text-[var(--ariome-gold)]" aria-hidden>
              <GraduationCap className="size-7" />
            </span>
          }
        />
        <div className="mt-4">
          <ProgramsHub />
        </div>
      </StreamingShell>
    </Demo7Layout>
  );
}
