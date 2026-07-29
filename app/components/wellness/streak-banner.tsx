'use client';

import { getPracticeStreak, streakMessage } from '@/lib/wellness/streaks';
import { Flame, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = { refreshKey?: number };

export default function StreakBanner({ refreshKey = 0 }: Props) {
  const [streak, setStreak] = useState<ReturnType<typeof getPracticeStreak> | null>(null);

  useEffect(() => {
    setStreak(getPracticeStreak());
  }, [refreshKey]);

  if (!streak) return null;

  const today = new Date().toISOString().slice(0, 10);
  const practicedToday = streak.practicedDates.includes(today);

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50 to-teal-50 p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow">
          <Flame className="size-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Streak tracking</p>
          <p className="text-lg font-semibold text-gray-900">{streakMessage(streak)}</p>
          <p className="text-xs text-gray-600">
            {practicedToday ? 'You practiced today' : 'Complete a session to log today'}
            {' · '}
            {streak.totalSessions} total sessions
          </p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="flex items-center justify-end gap-1 text-xs font-medium text-gray-500">
            <Trophy className="size-3.5 text-amber-600" aria-hidden />
            Best
          </p>
          <p className="text-2xl font-bold tabular-nums text-gray-900">{streak.longestStreak}</p>
        </div>
      </div>
    </div>
  );
}
