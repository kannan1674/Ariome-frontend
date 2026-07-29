'use client';

import { getStoredSessionMeta } from '@/lib/auth/sessionManager';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

function formatRemaining(totalSeconds: number) {
  const sec = Math.max(0, totalSeconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${Math.max(1, m)} min`;
}

type Props = {
  className?: string;
};

/** Shows remaining session time from `sessionInfo` cookie (matches backend SESSION_INFO_EXPIRE_MINUTES). */
export default function SessionInfoBadge({ className }: Props) {
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const meta = getStoredSessionMeta();
      if (!meta?.sessionExpiresAt) {
        setRemaining(null);
        return;
      }
      const endMs = new Date(meta.sessionExpiresAt).getTime();
      const sec = Math.floor((endMs - Date.now()) / 1000);
      setRemaining(formatRemaining(sec));
    };

    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!remaining) return null;

  return (
    <span
      className={cn(
        'rounded-full border border-teal-200/80 bg-teal-50/90 px-2.5 py-1 text-[11px] font-medium tabular-nums text-teal-800',
        className,
      )}
      title="Time until your session ends (sign in again after)"
    >
      Session: {remaining}
    </span>
  );
}
