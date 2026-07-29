'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { resetPassword } from '@/lib/Actions/authActions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  ChangePasswordSchemaType,
  getChangePasswordSchema,
} from '../forms/change-password-schema';
import Link from 'next/link';
import { AuthSplitLayout, authFieldClass, authLabelClass } from '@/components/auth/AuthSplitLayout';
import { showSuccess } from '@/lib/utils/toast';
import { cn } from '@/lib/utils';

const RESET_PENDING_EMAIL_KEY = 'resetPendingEmail';

export default function ResetPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RESET_PENDING_EMAIL_KEY) || '';
      setPendingEmail(stored);
      if (!stored) {
        setError('Missing reset session. Please start from forgot password.');
      }
    } catch {
      setError('Unable to read reset session. Please start again.');
    }
  }, []);

  const form = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(getChangePasswordSchema()),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: ChangePasswordSchemaType) {
    if (!pendingEmail) {
      setError('Missing reset session. Please start from forgot password.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = (await dispatch(
        resetPassword({ email: pendingEmail, newPassword: values.confirmPassword }),
      )) as {
        error?: string;
        HttpResponse?: { StatusCode?: number; Message?: string };
        Message?: string;
        message?: string;
      };

      if (result?.error) throw new Error(result.error);

      const statusCode = result?.HttpResponse?.StatusCode;
      const message =
        result?.HttpResponse?.Message || result?.Message || result?.message || 'Password reset successful.';
      if (statusCode && statusCode !== 200) throw new Error(message);

      form.reset();
      try {
        localStorage.removeItem(RESET_PENDING_EMAIL_KEY);
      } catch {
        // Ignore storage errors
      }
      showSuccess(message);
      router.push('/signin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <AuthSplitLayout variant="signin">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-md flex-col space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold uppercase tracking-[0.06em] text-zinc-900">Reset password</h1>
            <p className="text-sm leading-relaxed text-zinc-500">
              Set a new password for <span className="font-medium text-zinc-900">{pendingEmail || 'your account'}</span>.
            </p>
          </div>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          ) : null}

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={cn(authLabelClass, 'normal-case tracking-normal text-zinc-700')}>
                  New password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className={cn(authFieldClass, 'pr-11', fieldState.error && 'border-red-500')}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                      aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                    >
                      {passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={cn(authLabelClass, 'normal-case tracking-normal text-zinc-700')}>
                  Confirm password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={passwordConfirmationVisible ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      className={cn(authFieldClass, 'pr-11', fieldState.error && 'border-red-500')}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordConfirmationVisible(!passwordConfirmationVisible)}
                      className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                      aria-label={passwordConfirmationVisible ? 'Hide password' : 'Show password'}
                    >
                      {passwordConfirmationVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isProcessing}
            className="h-11 w-full rounded-md bg-zinc-900 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60"
          >
            {isProcessing ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircleIcon className="size-4 animate-spin" />
                Resetting...
              </span>
            ) : (
              'Reset password'
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
