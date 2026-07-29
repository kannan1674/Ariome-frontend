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
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AuthSplitLayout, authFieldClass, authLabelClass } from '@/components/auth/AuthSplitLayout';
import { showError, showSuccess } from '@/lib/utils/toast';
import { cn } from '@/lib/utils';

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
    <AuthSplitLayout variant="signin">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-md flex-col space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold uppercase tracking-[0.06em] text-zinc-900">Forgot password</h1>
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
                <FormLabel className={cn(authLabelClass, 'normal-case tracking-normal text-zinc-700')}>
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    {...field}
                    className={cn(authFieldClass, fieldState.error && 'border-red-500 focus-visible:ring-red-200')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-md bg-zinc-900 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60"
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
            <Link href="/signin" className="font-semibold text-teal-800 hover:text-teal-950 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </Form>
    </AuthSplitLayout>
  );
}
