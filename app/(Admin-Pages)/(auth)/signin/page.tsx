'use client';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { login, loginWithGoogle, getMobileCountryCode } from '@/lib/Actions/authActions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoaderCircleIcon } from 'lucide-react';
import { getSigninSchema, SigninSchemaType } from '../forms/signin-schema';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { showError, showInfo } from '@/lib/utils/toast';
import { AuthSplitLayout, authFieldClass, authLabelClass } from '@/components/auth/AuthSplitLayout';
import { PremiumIdentifierField } from '@/components/auth/PremiumIdentifierField';
import { PremiumRememberCheckbox } from '@/components/auth/PremiumRememberCheckbox';
import { Icons } from '@/components/common/icons';
import { cn } from '@/lib/utils';
import { setCookie } from '@/lib/utils/cookieUtils';
import {
  getDefaultPathForRole,
  isRoleScopedPath,
  resolveUserRole,
  type AppRole,
} from '@/lib/auth/resolveUserRole';

// Temporarily comment out recaptcha imports until packages are installed
// import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
// import { verifyRecaptcha } from '../utils/verifyRecaptchaClient';
// import { validateRecaptchaConfig, getRecaptchaErrorMessage } from '@/lib/recaptcha-config';

// Removed interface as this is now a page component

// Optimized fingerprint generation - memoized to avoid recalculation
const generateClientFingerprint = (): string => {
  // Check if we're in browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'server-side-fingerprint';
  }

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const userAgent = navigator.userAgent;
  const screenInfo = typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'unknown-screen';
  const rawFingerprint = `${timestamp}-${random}-${userAgent}-${screenInfo}`;

  // Optimized hash function
  let hash = 0;
  for (let i = 0; i < rawFingerprint.length; i++) {
    const char = rawFingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// Generate client-side security parameters
const generateClientSecurityParams = async (): Promise<{
  nonce: string;
  timestamp: string;
  signature: string;
}> => {
  const nonce = Math.floor(Math.random() * 10000000).toString();
  const timestamp = Date.now().toString();
  const data = `${nonce}:${timestamp}`;

  // Use Web Crypto API for client-side hashing
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return { nonce, timestamp, signature };
};

/** Treat as email when user typed @ or any letter; otherwise local mobile digits only. */
function getIdentifierInputMode(value: string): 'email' | 'phone' {
  const t = String(value ?? '').trim();
  if (t.includes('@')) return 'email';
  if (/[a-zA-Z]/.test(t)) return 'email';
  return 'phone';
}

type PostLoginResult = {
  error?: string;
  HttpResponse?: { StatusCode?: number; Message?: string };
  Content?: {
    ClubRoleId?: number;
    accountTypeId?: number;
    AccountTypeId?: number;
    role?: AppRole;
    IsVerified?: boolean;
    ProfileVerificationId?: string | null;
  };
};

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleCredentialHandlerRef = useRef<(credential: string) => void>(() => {});
  const [gsiReady, setGsiReady] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const mobileDialCodes = useAppSelector((state) => state.authState.mobileDialCodes);
  const mobileCountryCodesRaw = useAppSelector((state) => state.authState.content);
  const mobileCountryCodes = useMemo(() => {
    if (Array.isArray(mobileDialCodes) && mobileDialCodes.length > 0) {
      return mobileDialCodes as { Id?: string; Code?: string; DialDisplay?: string }[];
    }
    if (Array.isArray(mobileCountryCodesRaw)) {
      return mobileCountryCodesRaw as { Id?: string; Code?: string; DialDisplay?: string }[];
    }
    if (Array.isArray((mobileCountryCodesRaw as { Content?: unknown[] })?.Content)) {
      return (mobileCountryCodesRaw as { Content: { Id?: string; Code?: string; DialDisplay?: string }[] })
        .Content;
    }
    return [];
  }, [mobileDialCodes, mobileCountryCodesRaw]);

  // Navigation handlers
  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  // Use Redux state instead of local state
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.authState);

  /** Redirect after login (Redux may update before processLoginResult runs). */
  useEffect(() => {
    if (!isAuthenticated || !user?.token) return;

    const returnUrl = searchParams.get('returnUrl');
    const role = resolveUserRole(user);
    const defaultPath = getDefaultPathForRole(role);
    const redirectPath =
      returnUrl && returnUrl.startsWith('/') && !isRoleScopedPath(returnUrl, role)
        ? returnUrl
        : defaultPath;

    router.replace(redirectPath);
  }, [isAuthenticated, user, router, searchParams]);

  // Check reCAPTCHA configuration on component mount
  // useEffect(() => {
  //   validateRecaptchaConfig();
  // }, []);

  // Memoized default values to prevent unnecessary re-renders
  const defaultValues = useMemo(() => ({
    Username: '',
    password: '',
    fingerprint: generateClientFingerprint(),
    MobileNumberCcId: '',
    MobileNumberCc: '91',
    Nonce: '',
    Timestamp: '',
    Signature: '',
  }), []);

  const form = useForm<SigninSchemaType>({
    resolver: zodResolver(getSigninSchema()),
    defaultValues,
  });

  const mobileCcIdWatch = useWatch({ control: form.control, name: 'MobileNumberCcId' });

  // State for security parameters - only setter is used, value is never read
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_securityParams, setSecurityParams] = useState<{
    Nonce: string;
    Timestamp: string;
    Signature: string;
  } | null>(null);

  // Dispatch action to get mobile country codes on component mount
  useEffect(() => {
    dispatch(getMobileCountryCode());
  }, [dispatch]);

  // Set default country code (India +91) when data loads
  useEffect(() => {
    if (mobileCountryCodes.length > 0 && !form.getValues('MobileNumberCcId')) {
      // Find India by country code "IN" or by code "91"
      const india = mobileCountryCodes.find((code: any) => 
        code.CountryCode === 'IN' || code.Code === '91'
      );
      if (india) {
        form.setValue('MobileNumberCcId', india.Id);
        form.setValue('MobileNumberCc', india.Code);
      }
    }
  }, [mobileCountryCodes, form]);

  // Generate security parameters on mount
  useEffect(() => {
    const initSecurityParams = async () => {
      const params = await generateClientSecurityParams();
      setSecurityParams({
        Nonce: params.nonce,
        Timestamp: params.timestamp,
        Signature: params.signature,
      });

      // Set the values in the form
      form.setValue('Nonce', params.nonce);
      form.setValue('Timestamp', params.timestamp);
      form.setValue('Signature', params.signature);
    };
    initSecurityParams();
  }, [form]);

  const processLoginResult = useCallback(
    async (loginResult: PostLoginResult, verificationUsernameHint: string) => {
      const result = loginResult;

      if (result?.error) {
        return;
      }
      if (result?.HttpResponse?.StatusCode !== undefined && result.HttpResponse.StatusCode !== 200) {
        return;
      }

      const verificationId = result?.Content?.ProfileVerificationId;
      const isVerified = result?.Content?.IsVerified ?? true;

      if (verificationId && String(verificationId).trim() !== '' && isVerified === false) {
        if (typeof window !== 'undefined') {
          setCookie('profileVerificationId', verificationId, { maxAgeSeconds: 300 });
          setCookie('forgotPasswordId', verificationId, { maxAgeSeconds: 300 });

          try {
            localStorage.setItem('profileVerificationId', verificationId);
            localStorage.setItem('forgotPasswordId', verificationId);
            localStorage.setItem('forgotPasswordIdExpiry', String(Date.now() + 300000));
            if (verificationUsernameHint) {
              localStorage.setItem('registeredMobileNumber', verificationUsernameHint);
            }
            const returnUrl = searchParams.get('returnUrl');
            if (returnUrl) {
              localStorage.setItem('authReturnUrl', returnUrl);
            }
          } catch (storageError) {
            console.warn('Unable to persist verification id in localStorage:', storageError);
          }
        }

        const returnUrl = searchParams.get('returnUrl');
        const verifyPath = returnUrl
          ? `/Account-Verify?returnUrl=${encodeURIComponent(returnUrl)}`
          : '/Account-Verify';
        router.replace(verifyPath);
        return;
      }

      form.reset();
      const returnUrl = searchParams.get('returnUrl');
      const c = result?.Content;
      const accountTypeId = c?.accountTypeId ?? c?.AccountTypeId ?? c?.ClubRoleId;
      const role: AppRole =
        c?.role ||
        (accountTypeId === 3 ? 'admin' : accountTypeId === 2 ? 'teacher' : 'user');
      const defaultPath = getDefaultPathForRole(role);
      const redirectPath =
        returnUrl && returnUrl.startsWith('/') && !isRoleScopedPath(returnUrl, role)
          ? returnUrl
          : defaultPath;
      router.replace(redirectPath);
    },
    [form, router, searchParams],
  );

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      if (isLoading) {
        return;
      }
      try {
        const loginResult = (await dispatch(
          loginWithGoogle(credential) as never,
        )) as PostLoginResult & { Content?: { email?: string } };
        const emailHint = String(loginResult?.Content?.email || '').trim();
        await processLoginResult(loginResult, emailHint || 'google');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        if (
          !errorMessage.includes('Google sign-in failed') &&
          !errorMessage.includes('Google sign-in timeout')
        ) {
          showError(errorMessage);
        }
      }
    },
    [dispatch, isLoading, processLoginResult],
  );

  googleCredentialHandlerRef.current = (cred: string) => {
    void handleGoogleCredential(cred);
  };

  useEffect(() => {
    if (!googleClientId) return;
    const w = window as Window & { google?: { accounts?: { id?: unknown } } };
    if (w.google?.accounts?.id) {
      setGsiReady(true);
    }
  }, [googleClientId]);

  useEffect(() => {
    if (!gsiReady || !googleClientId || !googleBtnRef.current) {
      return;
    }
    const w = window as Window & {
      google?: {
        accounts: {
          id: {
            initialize: (config: { client_id: string; callback: (resp: { credential?: string }) => void }) => void;
            renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
          };
        };
      };
    };
    const g = w.google;
    if (!g?.accounts?.id) {
      return;
    }
    const el = googleBtnRef.current;
    el.innerHTML = '';
    g.accounts.id.initialize({
      client_id: googleClientId,
      callback: (resp: { credential?: string }) => {
        const c = resp?.credential;
        if (c) {
          googleCredentialHandlerRef.current(c);
        }
      },
    });
    // Match Sign in button width (form content width) so left/right edges align.
    const formEl = el.closest('form');
    const formWidth = formEl instanceof HTMLElement ? formEl.clientWidth : 0;
    const buttonWidth = Math.max(240, Math.floor(formWidth || el.clientWidth || 320));
    g.accounts.id.renderButton(el, {
      theme: 'outline',
      size: 'large',
      width: buttonWidth,
      text: 'continue_with',
      locale: 'en',
      shape: 'rectangular',
    });
  }, [gsiReady, googleClientId]);

  // Optimized form submission with better error handling and performance
  const onSubmit = useCallback(async (values: SigninSchemaType) => {
    if (isLoading) {
      return; // Prevent double submission
    }

    try {

      const loginResult = (await dispatch(
        login({
          Username: values.Username,
          password: values.password,
          MobileNumberCcId: values.MobileNumberCcId || '',
          MobileNumberCc: values.MobileNumberCc || '',
          fingerprint: values.fingerprint || '',
          ClubId: process.env.NEXT_PUBLIC_CLUB_ID || '1',
          rClubId: '0',
        }) as never,
      )) as PostLoginResult;

      if (loginResult?.error) {
        return;
      }

      await processLoginResult(loginResult, values.Username);
    } catch (err) {
      // Show error toast only for unexpected errors (network errors, timeouts, etc.)
      // API errors are already handled by clientApiCallWithoutToken
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      // Only show if it's not an API error (API errors are already shown)
      if (!errorMessage.includes('Login failed') && !errorMessage.includes('Login request timeout')) {
        showError(errorMessage);
      }
    }
  }, [isLoading, dispatch, processLoginResult]);

  const handleFormSubmit = form.handleSubmit(onSubmit)

  return (
    <AuthSplitLayout variant="signin">
      {googleClientId ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGsiReady(true)}
        />
      ) : null}
      <Form {...form}>
        <form
          method="post"
          onSubmit={(event) => {
            event.preventDefault();
            handleFormSubmit(event);
          }}
          className="mx-auto flex w-full max-w-md flex-col space-y-5"
        >
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          ) : null}

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold uppercase tracking-[0.06em] text-zinc-900">Welcome back !</h1>
            <p className="text-sm leading-relaxed text-zinc-500">
              Welcome back! Please enter your details.
            </p>
          </div>

        <FormField
          control={form.control}
          name="Username"
          render={({ field, fieldState }) => {
            const selectedCountry = mobileCountryCodes.find((code: any) => code.Id === mobileCcIdWatch);
            const identifierMode = getIdentifierInputMode(field.value);

            return (
              <FormItem className="w-full">
                <FormControl>
                  <PremiumIdentifierField
                    id="admin-signin-username"
                    label="Mobile or email"
                    value={field.value}
                    name={field.name}
                    onBlur={field.onBlur}
                    error={!!fieldState.error}
                    identifierMode={identifierMode}
                    countries={mobileCountryCodes}
                    selectedCountry={selectedCountry}
                    onCountrySelect={(country) => {
                      form.setValue('MobileNumberCcId', country.Id ?? '');
                      form.setValue('MobileNumberCc', country.Code ?? '');
                    }}
                    onChange={(raw) => {
                      const mode = getIdentifierInputMode(raw);
                      if (mode === 'email') {
                        field.onChange(raw.replace(/\s/g, ''));
                      } else {
                        field.onChange(raw.replace(/\D/g, '').slice(0, 10));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFormSubmit(e as any);
                        return;
                      }
                      const mode = getIdentifierInputMode(
                        `${field.value}${e.key.length === 1 ? e.key : ''}`,
                      );
                      if (mode === 'email') {
                        return;
                      }
                      if (
                        [46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                        (e.keyCode === 65 && e.ctrlKey === true) ||
                        (e.keyCode === 67 && e.ctrlKey === true) ||
                        (e.keyCode === 86 && e.ctrlKey === true) ||
                        (e.keyCode === 88 && e.ctrlKey === true) ||
                        (e.keyCode >= 35 && e.keyCode <= 39)
                      ) {
                        return;
                      }
                      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const paste = e.clipboardData?.getData('text') ?? '';
                      const mode = getIdentifierInputMode(paste);
                      if (mode === 'email') {
                        field.onChange(paste.replace(/\s/g, ''));
                      } else {
                        field.onChange(paste.replace(/\D/g, '').slice(0, 10));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="MobileNumberCcId"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} value={field.value ?? ''} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="MobileNumberCc"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} value={field.value ?? ''} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem className="w-full">
              <FormLabel className={authLabelClass}>
                Password <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter your password"
                    type={passwordVisible ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...field}
                    value={field.value || ''}
                    className={cn(authFieldClass, 'pr-11', fieldState.error && 'border-red-500 focus-visible:ring-red-200')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFormSubmit(e as any);
                      }
                    }}
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

        <div className="flex items-center justify-between gap-3 pt-0.5">
          <PremiumRememberCheckbox
            checked={rememberMe}
            onCheckedChange={setRememberMe}
            label="Remember me"
          />
          <button
            type="button"
            className="text-sm font-semibold text-teal-800 underline-offset-2 hover:text-teal-950 hover:underline"
            onClick={handleForgotPassword}
          >
            Forgot password
          </button>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 w-full rounded-md bg-zinc-900 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircleIcon className="size-4 animate-spin" />
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </Button>

        {googleClientId ? (
          <div className="flex w-full justify-center">
            <div
              ref={googleBtnRef}
              className="gsi-container mx-auto flex min-h-11 w-full justify-center overflow-hidden [&>div]:!mx-auto [&>div]:!block [&>div]:!w-full [&_iframe]:!mx-auto"
              aria-label="Continue with Google"
            />
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="mx-auto flex h-11 w-full max-w-md items-center justify-center rounded-md border-zinc-200 bg-white text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            onClick={() => showInfo('Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and backend GOOGLE_CLIENT_ID to enable Google sign-in.')}
          >
            <Icons.googleColorful className="mr-2 size-5" />
            Continue with Google
          </Button>
        )}

        <p className="pt-1 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-teal-800 hover:text-teal-950 hover:underline">
            Sign up
          </Link>
        </p>
        </form>
      </Form>
    </AuthSplitLayout>
  );
}
