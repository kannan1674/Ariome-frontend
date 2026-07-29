'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { showSuccess, showError } from '@/lib/utils/toast';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { forgotPassword, verifyForgotPasswordOtp } from '@/lib/Actions/authActions';
import { PremiumOtpVerification } from '@/components/auth/PremiumOtpVerification';

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
        setOtpError('Missing reset session. Please request a new code.');
      }
    } catch {
      setOtpError('Unable to read reset session. Please request a new code.');
    }
  }, []);

  useEffect(() => {
    if (authError) {
      setOtpError(authError);
    }
  }, [authError]);

  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a 6-digit code');
      return;
    }
    if (!pendingEmail) {
      setOtpError('Missing reset session. Please request a new code.');
      return;
    }

    setOtpError('');
    setIsProcessing(true);
    try {
      const result = await dispatch(verifyForgotPasswordOtp({ email: pendingEmail, otp }) as any);
      if (result && 'error' in result && result.error) {
        setOtpError(String(result.error) || 'Invalid code');
        return;
      }
      showSuccess('Code verified successfully');
      router.push('/reset-password');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
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
      showSuccess('Code resent successfully');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to resend code');
    }
  };

  return (
    <PremiumOtpVerification
      email={pendingEmail}
      otp={otp}
      onOtpChange={(value) => {
        setOtp(value);
        if (otpError) setOtpError('');
      }}
      onVerify={handleOtpSubmit}
      onResend={handleResendOTP}
      isProcessing={isProcessing}
      error={otpError}
      backHref="/forgot-password"
      backLabel="Back to Forgot password"
      verifyLabel="Verify Account"
    />
  );
}
