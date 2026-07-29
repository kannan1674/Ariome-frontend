'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getSignupSchema, SignupSchemaType } from '../forms/signup-schema';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { getMobileCountryCode, register } from '@/lib/Actions/authActions';
import { showSuccess, showError, showInfo } from '@/lib/utils/toast';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { authLinkClass, authPrimaryButtonClass } from '@/components/auth/authTheme';
import { PremiumAuthField } from '@/components/auth/PremiumAuthField';
import { PremiumMobileField } from '@/components/auth/PremiumMobileField';
import { PremiumPasswordField } from '@/components/auth/PremiumPasswordField';
import { ConfirmPasswordField } from '@/components/auth/ConfirmPasswordField';
import { Icons } from '@/components/common/icons';

const REGISTER_PENDING_EMAIL_KEY = 'registerPendingEmail';

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mobileDialCodes = useAppSelector((state) => state.authState.mobileDialCodes);
  const mobileCountryCodesRaw = useAppSelector((state) => state.authState.content);
  const mobileCountryCodes = useMemo(() => {
    if (Array.isArray(mobileDialCodes) && mobileDialCodes.length > 0) {
      return mobileDialCodes as { Id: string; Country?: string; DialDisplay?: string; Code?: string }[];
    }
    if (Array.isArray(mobileCountryCodesRaw)) {
      return mobileCountryCodesRaw as { Id: string; Country?: string; DialDisplay?: string; Code?: string }[];
    }
    if (Array.isArray((mobileCountryCodesRaw as { Content?: unknown[] })?.Content)) {
      return (mobileCountryCodesRaw as { Content: { Id: string; Country?: string; DialDisplay?: string; Code?: string }[] })
        .Content;
    }
    return [];
  }, [mobileDialCodes, mobileCountryCodesRaw]);

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(getSignupSchema()),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      mobileCountryCodeId: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const mobileCountryCodeIdWatch = useWatch({ control: form.control, name: 'mobileCountryCodeId' });

  useEffect(() => {
    dispatch(getMobileCountryCode());
  }, [dispatch]);

  useEffect(() => {
    if (mobileCountryCodes.length === 0) return;
    if (form.getValues('mobileCountryCodeId')) return;
    const india = mobileCountryCodes.find(
      (c: { CountryCode?: string; Code?: string }) => c.CountryCode === 'IN' || c.Code === '91',
    );
    if (india) {
      form.setValue('mobileCountryCodeId', india.Id);
    }
  }, [mobileCountryCodes, form]);

  const handleRegister = async (values: SignupSchemaType) => {
    setIsProcessing(true);
    setError(null);
    try {
      const selectedCc = mobileCountryCodes.find(
        (code: { Id?: string }) => code.Id === values.mobileCountryCodeId,
      ) as { Code?: string } | undefined;
      const countryCode = String(selectedCc?.Code ?? '91').replace(/\D/g, '') || '91';

      const result = (await dispatch(
        register({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          countryCode,
          mobileNumber: values.mobile.replace(/\D/g, ''),
          password: values.password,
          confirmPassword: values.passwordConfirmation,
        }) as never,
      )) as { error?: string } | { HttpResponse?: { StatusCode?: number; Message?: string } };

      if (result && typeof result === 'object' && 'error' in result && result.error) {
        const errMsg = String(result.error);
        setError(errMsg);
        showError(errMsg);
        return;
      }

      const responseData = result as {
        HttpResponse?: { StatusCode?: number; Message?: string };
        Content?: { email?: string };
      };

      if (responseData?.HttpResponse?.StatusCode && responseData.HttpResponse.StatusCode !== 200) {
        const message = responseData.HttpResponse.Message || 'Registration failed.';
        setError(message);
        showError(message);
        return;
      }

      const msg =
        responseData?.HttpResponse?.Message ||
        'Registered successfully. Check your email for a verification code.';
      showSuccess(msg);

      try {
        localStorage.setItem(REGISTER_PENDING_EMAIL_KEY, values.email.trim().toLowerCase());
        localStorage.setItem('verificationMessage', msg);
      } catch {
        /* ignore */
      }

      form.reset();
      setTimeout(() => router.push('/Account-Verify'), 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      setError(message);
      showError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Suspense fallback={null}>
      <AuthSplitLayout variant="signup">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleRegister)}
            className="mx-auto flex w-full min-w-0 max-w-md flex-col space-y-4 sm:space-y-5"
          >
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold uppercase tracking-[0.06em] text-zinc-900 sm:text-2xl">Create an account</h1>
              <p className="text-sm leading-relaxed text-zinc-500">
                Enter your details below. We will email you a code to verify your address.
              </p>
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <PremiumAuthField
                        id="signup-first-name"
                        label="First name"
                        placeholder="First name"
                        autoComplete="given-name"
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
                name="lastName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <PremiumAuthField
                        id="signup-last-name"
                        label="Last name"
                        placeholder="Last name"
                        autoComplete="family-name"
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
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <PremiumAuthField
                      id="signup-email"
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

            <FormField
              control={form.control}
              name="mobile"
              render={({ field, fieldState }) => {
                const selectedCountry = mobileCountryCodes.find(
                  (code: { Id?: string }) => code.Id === mobileCountryCodeIdWatch,
                );

                return (
                  <FormItem>
                    <FormControl>
                      <PremiumMobileField
                        id="signup-mobile"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        error={!!fieldState.error}
                        countries={mobileCountryCodes}
                        selectedCountry={selectedCountry}
                        onCountrySelect={(country) =>
                          form.setValue('mobileCountryCodeId', country.Id)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="mobileCountryCodeId"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <PremiumPasswordField
                      id="signup-password"
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
              name="passwordConfirmation"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <ConfirmPasswordField
                      id="signup-password-confirm"
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
                  Creating account…
                </span>
              ) : (
                'Sign up'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-md border-zinc-200 bg-white text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
              onClick={() => showInfo('Google sign-up is not configured yet.')}
            >
              <Icons.googleColorful className="mr-2 size-5" />
              Sign up with Google
            </Button>

            <p className="pt-1 text-center text-sm text-zinc-500">
              Already have an account?{' '}
              <Link href="/signin" className={authLinkClass}>
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </AuthSplitLayout>
    </Suspense>
  );
}
