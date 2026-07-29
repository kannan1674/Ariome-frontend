'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { resetPassword } from '@/lib/Actions/authActions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  ChangePasswordSchemaType,
  getChangePasswordSchema,
} from '../forms/change-password-schema';
import Link from 'next/link';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { PremiumPasswordField } from '@/components/auth/PremiumPasswordField';
import { ConfirmPasswordField } from '@/components/auth/ConfirmPasswordField';
import { authLinkClass, authPrimaryButtonClass } from '@/components/auth/authTheme';
import { showSuccess } from '@/lib/utils/toast';

const RESET_PENDING_EMAIL_KEY = 'resetPendingEmail';

export default function ResetPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    <AuthSplitLayout variant="reset">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto flex w-full min-w-0 max-w-md flex-col space-y-4 sm:space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold uppercase tracking-[0.06em] text-zinc-900 sm:text-2xl">Reset password</h1>
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
                <FormControl>
                  <PremiumPasswordField
                    id="reset-new-password"
                    label="New password"
                    placeholder="Enter new password"
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <ConfirmPasswordField
                    id="reset-confirm-password"
                    label="Confirm password"
                    placeholder="Confirm new password"
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
            disabled={isProcessing}
            className={authPrimaryButtonClass}
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
            <Link href="/signin" className={authLinkClass}>
              Sign in
            </Link>
          </p>
        </form>
      </Form>
    </AuthSplitLayout>
  );
}
