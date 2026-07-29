'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, LoaderCircleIcon, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumOtpInput } from '@/components/auth/PremiumOtpInput';
import {
  PremiumVerificationCard,
  PremiumVerificationLayout,
} from '@/components/auth/PremiumVerificationLayout';

const OTP_LENGTH = 6;
const OTP_DURATION_SECONDS = 180;

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type PremiumOtpVerificationProps = {
  email: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onVerify: () => void | Promise<void>;
  onResend: () => void | Promise<void>;
  isProcessing?: boolean;
  error?: string;
  verifyLabel?: string;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
};

export function PremiumOtpVerification({
  email,
  otp,
  onOtpChange,
  onVerify,
  onResend,
  isProcessing = false,
  error = '',
  verifyLabel = 'Verify Account',
  backHref = '/forgot-password',
  backLabel = 'Back',
  onBack,
}: PremiumOtpVerificationProps) {
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION_SECONDS);
  const progress = (otp.length / OTP_LENGTH) * 100;
  const canResend = secondsLeft === 0;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const handleResend = useCallback(async () => {
    if (!canResend) return;
    await onResend();
    setSecondsLeft(OTP_DURATION_SECONDS);
  }, [canResend, onResend]);

  return (
    <PremiumVerificationLayout>
      <PremiumVerificationCard
        icon={<Lock className="size-6" strokeWidth={1.75} />}
        title="Verification Code"
        subtitle={
          <>
            Enter the 6-digit code sent to{' '}
            <span className="font-medium text-teal-200">{email || 'your email'}</span>
          </>
        }
        footer={
          onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-zinc-500 transition hover:text-teal-300"
            >
              {backLabel}
            </button>
          ) : backHref ? (
            <Link
              href={backHref}
              className="text-sm font-medium text-zinc-500 transition hover:text-teal-300"
            >
              {backLabel}
            </Link>
          ) : null
        }
      >
        <div className="space-y-5">
          <PremiumOtpInput
            value={otp}
            onChange={onOtpChange}
            error={!!error}
            disabled={isProcessing}
          />

          <div className="h-1.5 overflow-hidden rounded-full bg-indigo-950/80 ring-1 ring-white/5">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="inline-flex items-center justify-center gap-1.5 text-zinc-500 sm:justify-start">
              <Clock className="size-3.5 shrink-0" />
              <span className="tabular-nums">{formatTimer(secondsLeft)}</span>
            </div>
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={!canResend || isProcessing}
              className={cn(
                'font-semibold transition',
                canResend
                  ? 'text-teal-400 hover:text-teal-300'
                  : 'cursor-not-allowed text-zinc-600',
              )}
            >
              Resend Code
            </button>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void onVerify()}
            disabled={isProcessing || otp.length !== OTP_LENGTH}
            className={cn(
              'flex h-12 w-full items-center justify-center rounded-xl bg-purple-600 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isProcessing ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircleIcon className="size-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              verifyLabel
            )}
          </button>
        </div>
      </PremiumVerificationCard>
    </PremiumVerificationLayout>
  );
}
