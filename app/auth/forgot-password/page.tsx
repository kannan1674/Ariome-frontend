'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { forgotPassword } from '@/lib/Actions/authActions';
import { getForgotPasswordSchema, ForgotPasswordSchemaType } from '../forms/forgot-password-schema';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { PremiumAuthField } from '@/components/auth/PremiumAuthField';
import { authLinkClass, authPrimaryButtonClass } from '@/components/auth/authTheme';
import { showError, showSuccess } from '@/lib/utils/toast';

const RESET_PENDING_EMAIL_KEY = 'resetPendingEmail';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.authState);

  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(getForgotPasswordSchema()),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordSchemaType) => {
    const email = data.email.trim().toLowerCase();
    try {
      const result = await dispatch(forgotPassword({ email }) as any);
      if (result && 'error' in result && result.error) {
        showError(String(result.error) || 'Failed to send reset OTP');
        return;
      }

      try {
        localStorage.setItem(RESET_PENDING_EMAIL_KEY, email);
      } catch {
        // Non-fatal: continue flow even if storage fails
      }

      showSuccess('OTP sent to your email');
      router.push('/Verify-Otp');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      showError(message);
    }
  };

  return (
    <AuthSplitLayout variant="forgot">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto flex w-full min-w-0 max-w-md flex-col space-y-4 sm:space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold uppercase tracking-[0.06em] text-zinc-900 sm:text-2xl">Forgot password</h1>
            <p className="text-sm leading-relaxed text-zinc-500">
              Enter your account email. We will send a 6-digit OTP to verify your reset request.
            </p>
          </div>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          ) : null}

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <PremiumAuthField
                    id="forgot-password-email"
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className={authPrimaryButtonClass}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircleIcon className="size-4 animate-spin" />
                Sending OTP...
              </span>
            ) : (
              'Send OTP'
            )}
          </Button>

          <p className="pt-1 text-center text-sm text-zinc-500">
            Back to{' '}
            <Link href="/signin" className={authLinkClass}>
              Sign in
            </Link>
          </p>
        </form>
      </Form>
    </AuthSplitLayout>
  );
}
