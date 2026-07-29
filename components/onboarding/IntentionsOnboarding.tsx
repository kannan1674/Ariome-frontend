'use client';

import { useCallback, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Leaf,
  Check,
  Heart,
  Plus,
  Sprout,
  HandHeart,
  PersonStanding,
  ShieldCheck,
  Palette,
  UsersRound,
  Hand,
} from 'lucide-react';

/** Primary accent — teal close to reference (#00bfa5) */
const accent = {
  DEFAULT: '#00c4ad',
  muted: '#1e1b4b',
  glow: 'rgba(0, 196, 173, 0.22)',
  border: '#00d4be',
} as const;

export type IntentionId =
  | 'healing'
  | 'growth'
  | 'gratitude'
  | 'presence'
  | 'trust'
  | 'creativity'
  | 'connection'
  | 'acceptance';

const INTENTIONS: {
  id: IntentionId;
  title: string;
  description: string;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: 'healing',
    title: 'Healing',
    description: 'Finding comfort and recovery',
    Icon: Heart,
    iconBg: 'bg-[#2a1528]',
    iconColor: 'text-[#e879a9]',
  },
  {
    id: 'growth',
    title: 'Growth',
    description: 'Embracing personal evolution',
    Icon: Sprout,
    iconBg: 'bg-[#14261c]',
    iconColor: 'text-[#4ade80]',
  },
  {
    id: 'gratitude',
    title: 'Gratitude',
    description: 'Cultivating thankfulness',
    Icon: HandHeart,
    iconBg: 'bg-[#2a1f14]',
    iconColor: 'text-[#fb923c]',
  },
  {
    id: 'presence',
    title: 'Presence',
    description: 'Being fully here now',
    Icon: PersonStanding,
    iconBg: 'bg-[#1e1633]',
    iconColor: 'text-[#a78bfa]',
  },
  {
    id: 'trust',
    title: 'Trust',
    description: 'Building confidence in life',
    Icon: ShieldCheck,
    iconBg: 'bg-[#142536]',
    iconColor: 'text-[#38bdf8]',
  },
  {
    id: 'creativity',
    title: 'Creativity',
    description: 'Expressing your inner world',
    Icon: Palette,
    iconBg: 'bg-[#2a1520]',
    iconColor: 'text-[#fb7185]',
  },
  {
    id: 'connection',
    title: 'Connection',
    description: 'Deepening relationships',
    Icon: UsersRound,
    iconBg: 'bg-[#0f2530]',
    iconColor: 'text-[#22d3ee]',
  },
  {
    id: 'acceptance',
    title: 'Acceptance',
    description: 'Embracing what is',
    Icon: Hand,
    iconBg: 'bg-[#1a2415]',
    iconColor: 'text-[#a3e635]',
  },
];

function HealingIcon({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex', className)}>
      <Heart className="size-[1.35rem] text-[#e879a9]" strokeWidth={1.75} fill="currentColor" fillOpacity={0.12} />
      <Plus className="absolute -bottom-0.5 -right-0.5 size-3 text-[#fda4cf]" strokeWidth={2.5} />
    </span>
  );
}

export type IntentionsOnboardingProps = {
  onComplete: (selectedIds: IntentionId[]) => void;
};

export function IntentionsOnboarding({ onComplete }: IntentionsOnboardingProps) {
  const [selected, setSelected] = useState<Set<IntentionId>>(() => new Set());

  const toggle = useCallback((id: IntentionId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleContinue = useCallback(() => {
    onComplete(Array.from(selected));
  }, [onComplete, selected]);

  const handleSkip = useCallback(() => {
    onComplete([]);
  }, [onComplete]);

  return (
    <div
      className="relative min-h-screen flex flex-col text-white antialiased"
      style={{
        background:
          'radial-gradient(ellipse 85% 60% at 50% -22%, rgba(56, 189, 248, 0.26), transparent 58%), radial-gradient(ellipse 70% 48% at 15% 100%, rgba(34, 197, 94, 0.14), transparent 65%), linear-gradient(180deg, #111827 0%, #0b1020 55%, #05070f 100%)',
      }}
    >
      <main className="relative z-[1] flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
        <div className="w-full max-w-[42rem]">
          {/* Header */}
          <header className="flex flex-col items-center text-center">
            <div
              className="mb-8 flex size-[3.25rem] items-center justify-center rounded-full shadow-lg"
              style={{
                background: `linear-gradient(145deg, ${accent.DEFAULT} 0%, #0d9488 100%)`,
                boxShadow: `0 12px 40px -12px ${accent.glow}`,
              }}
              aria-hidden
            >
              <Leaf className="size-[1.35rem] text-white/95" strokeWidth={1.85} />
            </div>
            <h1 className="text-[1.65rem] font-medium leading-tight tracking-[-0.02em] text-white sm:text-4xl sm:leading-[1.15]">
              What brings you here?
            </h1>
            <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-zinc-500 sm:text-base">
              Select the intentions that resonate with you
            </p>
          </header>

          {/* Grid */}
          <div className="mt-10 grid grid-cols-1 gap-3.5 sm:mt-12 sm:grid-cols-2 sm:gap-4">
            {INTENTIONS.map(({ id, title, description, Icon, iconBg, iconColor }) => {
              const isSelected = selected.has(id);
              const isHealing = id === 'healing';

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  className={cn(
                    'group relative w-full rounded-[1.25rem] border text-left transition-all duration-300 ease-out',
                    'px-4 py-4 sm:rounded-3xl sm:px-5 sm:py-[1.125rem]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1020]',
                    isSelected
                      ? 'border-2 bg-[#10182b]'
                      : 'border border-white/[0.10] bg-[#0f172a]/85 hover:border-white/[0.18] hover:bg-[#17223a]/90',
                  )}
                  style={
                    isSelected
                      ? {
                          borderColor: accent.border,
                          boxShadow: `0 0 0 1px ${accent.glow}, 0 20px 48px -24px ${accent.glow}`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 sm:size-[3.25rem] sm:rounded-[1.125rem]',
                        iconBg,
                        isSelected && 'scale-[1.02]',
                      )}
                    >
                      {isHealing ? (
                        <HealingIcon />
                      ) : (
                        <Icon className={cn('size-[1.35rem] sm:size-6', iconColor)} strokeWidth={1.75} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="text-[0.9375rem] font-medium tracking-[-0.01em] text-white sm:text-base">
                        {title}
                      </div>
                      <p className="mt-1 text-[0.8125rem] leading-snug text-zinc-500 sm:text-sm">{description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-12 space-y-5 sm:mt-14">
            <Button
              type="button"
              onClick={handleContinue}
              className={cn(
                'h-[3.25rem] w-full rounded-2xl border-0 text-[0.9375rem] font-medium tracking-wide text-white sm:h-14 sm:rounded-[1.125rem] sm:text-base',
                'shadow-[0_16px_48px_-12px_rgba(0,196,173,0.45)] transition-all duration-300',
                'hover:brightness-110 hover:shadow-[0_20px_56px_-12px_rgba(0,196,173,0.5)] active:scale-[0.99]',
              )}
              style={{ backgroundColor: accent.DEFAULT }}
            >
              <span>Continue to AriOme</span>
              <Check className="ml-2 size-[1.125rem] opacity-95" strokeWidth={2.5} />
            </Button>
            <button
              type="button"
              onClick={handleSkip}
              className="block w-full py-1 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:text-zinc-400"
            >
              Skip for now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
