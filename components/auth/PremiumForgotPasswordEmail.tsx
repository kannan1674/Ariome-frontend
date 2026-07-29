'use client';

import Link from 'next/link';
import { LoaderCircleIcon, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PremiumVerificationCard,
  PremiumVerificationLayout,
} from '@/components/auth/PremiumVerificationLayout';

type PremiumForgotPasswordEmailProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
  fieldError?: boolean;
};

export function PremiumForgotPasswordEmail({
  email,
  onEmailChange,
  onSubmit,
  isLoading = false,
  error = '',
  fieldError = false,
}: PremiumForgotPasswordEmailProps) {
  return (
    <PremiumVerificationLayout>
      <PremiumVerificationCard
        icon={<Mail className="size-6" strokeWidth={1.75} />}
        title="Forgot Password"
        subtitle="Enter your email to receive a verification code and return to your wellness library."
        footer={
          <Link
            href="/signin"
            className="text-sm font-medium text-zinc-500 transition hover:text-teal-300"
          >
            Back to Sign in
          </Link>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
          className="space-y-5"
        >
          <div className="relative">
            <label htmlFor="forgot-email" className="sr-only">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className={cn(
                'h-12 w-full rounded-xl border bg-[#141c2e]/90 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-500',
                fieldError
                  ? 'border-red-400/80 ring-2 ring-red-500/25'
                  : 'border-teal-400/30 focus:border-fuchsia-400/70 focus:ring-2 focus:ring-fuchsia-500/30',
              )}
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-purple-600 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircleIcon className="size-4 animate-spin" />
                Sending code...
              </span>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </form>
      </PremiumVerificationCard>
    </PremiumVerificationLayout>
  );
}
