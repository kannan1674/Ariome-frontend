'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Bump CONTENT_VERSION when the poster/campaign changes so returning users see it again.
 * IMAGE stays the file path under /public.
 */
export const HOME_PROMO_CONTENT_VERSION = 'upcoming-features-2026-07-v4';
const HOME_PROMO_IMAGE = '/media/banners/c6996c1b-7ce4-4f65-8436-d7d640d4df25.png';

const STORAGE_PREFIX = 'ariome-home-promo';
const LEGACY_STORAGE_KEY = 'ariome-home-promo';
const SUPPRESS_MS = 7 * 24 * 60 * 60 * 1000; // several days
const DELAY_MS = 15_000;

type StoredPromo = {
  contentId: string;
  dismissedAt: number;
  userId?: string;
};

function storageKeyForUser(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function readStored(userId: string): StoredPromo | null {
  if (typeof window === 'undefined' || !userId) return null;
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPromo;
    if (!parsed?.contentId || typeof parsed.dismissedAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function shouldShowPromo(userId: string): boolean {
  if (!userId) return false;
  const stored = readStored(userId);
  if (!stored) return true;
  if (stored.contentId !== HOME_PROMO_CONTENT_VERSION) return true;
  return Date.now() - stored.dismissedAt >= SUPPRESS_MS;
}

function markDismissed(userId: string) {
  if (!userId) return;
  try {
    localStorage.setItem(
      storageKeyForUser(userId),
      JSON.stringify({
        contentId: HOME_PROMO_CONTENT_VERSION,
        dismissedAt: Date.now(),
        userId,
      } satisfies StoredPromo),
    );
    // Drop old browser-wide key so it doesn't confuse debugging
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

type HomePromoModalProps = {
  /** Logged-in user id — dismiss state is stored per account */
  userId?: string | null;
  enabled?: boolean;
};

/**
 * After login on Home: wait 15s, then show upcoming-features poster once per user.
 * Hidden for several days per account unless content version changes.
 */
export function HomePromoModal({ userId, enabled = true }: HomePromoModalProps) {
  const [open, setOpen] = useState(false);
  const activeUserId = userId?.trim() || '';
  const canRun = enabled && !!activeUserId;

  useEffect(() => {
    setOpen(false);
    if (!canRun) return;
    if (!shouldShowPromo(activeUserId)) return;

    const timerId = window.setTimeout(() => {
      setOpen(true);
    }, DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [canRun, activeUserId]);

  const dismiss = () => {
    markDismissed(activeUserId);
    setOpen(false);
  };

  if (!canRun) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
        else setOpen(true);
      }}
    >
      <DialogContent
        showCloseButton
        className="max-h-[92vh] w-[min(96vw,52rem)] max-w-[52rem] gap-0 overflow-hidden border-0 bg-zinc-950 p-0 text-white sm:rounded-2xl"
      >
        <DialogHeader className="sr-only mb-0">
          <DialogTitle>Upcoming features</DialogTitle>
          <DialogDescription>
            A preview of what is coming next on AriOme.
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full overflow-hidden bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element -- large static public asset */}
          <img
            src={HOME_PROMO_IMAGE}
            alt="Upcoming features on AriOme"
            className="mx-auto h-auto max-h-[min(78vh,720px)] w-full object-contain"
          />
        </div>

        <div className="space-y-3 px-6 py-5 sm:px-8">
          <p className="text-center text-base font-semibold tracking-wide text-white sm:text-lg">
            Upcoming features
          </p>
          <p className="text-center text-sm leading-relaxed text-zinc-400">
            A peek at what we are building next for your wellness journey.
          </p>
          <Button
            type="button"
            onClick={dismiss}
            className="h-12 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
