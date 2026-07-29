'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/lib/utils/toast';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { verifyEmail } from '@/lib/Actions/authActions';
import { isAuthenticated } from '@/lib/utils/tokenStorage';
import { AuthSplitLayout, authLabelClass } from '@/components/auth/AuthSplitLayout';
import { authLinkClass, authPrimaryButtonClass } from '@/components/auth/authTheme';
import { cn } from '@/lib/utils';

const REGISTER_PENDING_EMAIL_KEY = 'registerPendingEmail';

export default function VerifyMobilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated: isAuthFromRedux } = useAppSelector((state) => state.authState);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingRegisterEmail, setPendingRegisterEmail] = useState('');
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const authError = useAppSelector((state) => state.authState.error);

  // Function to mask mobile number (show only last 2 digits) - unused, commented out
  // const maskMobileNumber = (number: string) => {
  //   if (!number || number.length < 2) return number;
  //   const lastTwoDigits = number.slice(-2);
  //   const maskedDigits = 'x'.repeat(number.length - 2);
  //   return maskedDigits + lastTwoDigits;
  // };

  useEffect(() => {
    try {
      const regEmail = localStorage.getItem(REGISTER_PENDING_EMAIL_KEY);
      if (regEmail) {
        setPendingRegisterEmail(regEmail);
      }

      const storedMessage = localStorage.getItem('verificationMessage');
      if (storedMessage) {
        setVerificationMessage(storedMessage);
        localStorage.removeItem('verificationMessage');
      }
    } catch (storageError) {
      console.warn('Unable to access verification data from storage:', storageError);
    }
  }, [router]);

  useEffect(() => {
    if (authError) {
      setOtpError(authError);
      // Don't show toast here - API errors are already shown by clientApiCallWithoutToken
    }
  }, [authError]);

  const handleOtpSubmit = async () => {
    if (!otp) {
      setOtpError('Please provide OTP');
      return;
    }
    
    if (otp.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }

    if (!pendingRegisterEmail) {
      const message =
        'Missing signup session. Please complete sign up again — we will send a new code to your email.';
      setOtpError(message);
      showError(message);
      return;
    }

    setOtpError('');
    setIsProcessing(true);
    
    try {
      const result = (await dispatch(
        verifyEmail({ email: pendingRegisterEmail, otp }) as any,
      )) as { error?: string; HttpResponse?: { StatusCode?: number; Message?: string } };
      
      if (result && 'error' in result && result.error) {
        const errorMsg = String(result.error) || 'Invalid OTP. Please try again.';
        setOtpError(errorMsg);
      } else if (result?.HttpResponse?.StatusCode && result.HttpResponse.StatusCode !== 200) {
        const errorMsg = result.HttpResponse.Message || 'Verification failed.';
        setOtpError(errorMsg);
      } else {
        showSuccess('Email verified successfully!');
        
        // Get returnUrl from search params or localStorage
        const returnUrl = searchParams.get('returnUrl') || localStorage.getItem('authReturnUrl');
        
        // Clear localStorage
        localStorage.removeItem('forgotPasswordId');
        localStorage.removeItem('registeredMobileNumber');
        localStorage.removeItem(REGISTER_PENDING_EMAIL_KEY);
        localStorage.removeItem('authReturnUrl');
        
        // Check if user is already authenticated after verification
        const isLoggedIn = isAuthenticated() || isAuthFromRedux;
        
        // Redirect logic:
        // If user is logged in, go directly to returnUrl (or Home)
        // Otherwise, go to signin with returnUrl so they can login and be redirected
        let redirectPath = '/home';
        if (isLoggedIn && returnUrl && returnUrl.startsWith('/')) {
          redirectPath = returnUrl;
        } else if (!isLoggedIn && returnUrl && returnUrl.startsWith('/')) {
          redirectPath = `/signin?returnUrl=${encodeURIComponent(returnUrl)}`;
        } else if (!isLoggedIn) {
          redirectPath = '/signin';
        }
        
        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      }
    } catch (error) {
      let errorMessage = 'Invalid OTP. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setOtpError(errorMessage);
      // Only show toast for unexpected errors (not API errors which are already shown)
      if (!errorMessage.includes('HttpResponse') && !errorMessage.includes('StatusCode')) {
        showError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AuthSplitLayout variant="verify">
      <div className="mx-auto flex w-full min-w-0 max-w-md flex-col space-y-4 sm:space-y-5">
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold uppercase tracking-[0.06em] text-zinc-900 sm:text-2xl">Verify Your Account</h1>
          <p className="text-sm leading-relaxed text-zinc-500">
            {pendingRegisterEmail ? (
              <>
                Enter the 6-digit code sent to{' '}
                <span className="font-medium text-zinc-900">{pendingRegisterEmail}</span>.
              </>
            ) : (
              'Enter the 6-digit verification code from your email.'
            )}
          </p>
          {verificationMessage ? (
            <p className="text-xs text-zinc-500">{verificationMessage}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className={cn(authLabelClass, 'normal-case tracking-normal text-zinc-700')}>Verification code</p>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (otpError) setOtpError('');
            }}
            containerClassName="w-full justify-center"
          >
            <InputOTPGroup className="grid w-full max-w-[min(100%,320px)] grid-cols-6 gap-1.5 sm:max-w-none sm:flex sm:gap-2 md:gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className={cn(
                    'aspect-square h-auto w-full min-h-[2.75rem] max-h-11 rounded-md border bg-white text-center text-base shadow-sm transition-all sm:h-11 sm:w-11 sm:text-lg',
                    otpError
                      ? 'border-red-500 data-[active=true]:border-red-500 data-[active=true]:ring-red-200'
                      : 'border-zinc-200 data-[active=true]:border-teal-800 data-[active=true]:ring-teal-900/15',
                  )}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {otpError ? <p className="text-sm text-red-600">{otpError}</p> : null}
        </div>

        <Button
          onClick={handleOtpSubmit}
          disabled={isProcessing || otp.length !== 6}
          className={authPrimaryButtonClass}
        >
          {isProcessing ? 'Verifying…' : 'Verify email'}
        </Button>

        <p className="pt-1 text-center text-sm text-zinc-500">
          Need to sign in instead?{' '}
          <Link href="/signin" className={authLinkClass}>
            Sign in
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}