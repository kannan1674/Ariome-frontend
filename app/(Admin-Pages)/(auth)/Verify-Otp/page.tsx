'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/lib/utils/toast';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { forgotPassword, verifyForgotPasswordOtp } from '@/lib/Actions/authActions';
import { AuthSplitLayout, authLabelClass } from '@/components/auth/AuthSplitLayout';
import { cn } from '@/lib/utils';

const RESET_PENDING_EMAIL_KEY = 'resetPendingEmail';

export default function VerifyOtpPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const authError = useAppSelector((state) => state.authState.error);

  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem(RESET_PENDING_EMAIL_KEY) || '';
      setPendingEmail(storedEmail);
      if (!storedEmail) {
        setOtpError('Missing reset session. Please request a new OTP.');
      }
    } catch {
      setOtpError('Unable to read reset session. Please request a new OTP.');
    }
  }, []);

  useEffect(() => {
    if (authError) {
      setOtpError(authError);
    }
  }, [authError]);

  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }
    if (!pendingEmail) {
      setOtpError('Missing reset session. Please request a new OTP.');
      return;
    }

    setOtpError('');
    setIsProcessing(true);
    try {
      const result = await dispatch(verifyForgotPasswordOtp({ email: pendingEmail, otp }) as any);
      if (result && 'error' in result && result.error) {
        setOtpError(String(result.error) || 'Invalid OTP');
        return;
      }
      showSuccess('OTP verified successfully');
      router.push('/reset-password');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OTP verification failed';
      setOtpError(message);
      showError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendOTP = async () => {
    if (!pendingEmail) {
      setOtpError('Missing reset session. Please request reset again.');
      return;
    }
    try {
      const result = await dispatch(forgotPassword({ email: pendingEmail }) as any);
      if (result && 'error' in result && result.error) {
        showError(String(result.error));
        return;
      }
      showSuccess('OTP resent successfully');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to resend OTP');
    }
  };

  return (
    <AuthSplitLayout variant="signin">
      <div className="mx-auto flex w-full max-w-md flex-col space-y-5">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold uppercase tracking-[0.06em] text-zinc-900">Enter OTP</h1>
          <p className="text-sm leading-relaxed text-zinc-500">
            We sent a 6-digit code to <span className="font-medium text-zinc-900">{pendingEmail || 'your email'}</span>.
          </p>
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
            containerClassName="justify-center sm:justify-start"
          >
            <InputOTPGroup className="gap-2 sm:gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className={cn(
                    'h-11 w-11 rounded-md border bg-white text-center text-lg shadow-sm transition-all',
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
          className="h-11 w-full rounded-md bg-zinc-900 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {isProcessing ? 'Verifying...' : 'Verify OTP'}
        </Button>

        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          <span>Didn&apos;t get the code?</span>
          <button
            type="button"
            onClick={handleResendOTP}
            className="font-semibold text-teal-800 underline-offset-2 hover:text-teal-950 hover:underline"
          >
            Resend
          </button>
        </div>

        <p className="pt-1 text-center text-sm text-zinc-500">
          Back to{' '}
          <Link href="/forgot-password" className="font-semibold text-teal-800 hover:text-teal-950 hover:underline">
            Forgot password
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
