'use client';

import { useRef, useCallback } from 'react';

interface RecaptchaV2Hook {
  containerRef: React.RefObject<HTMLDivElement | null>;
  getToken: () => string | null;
  resetCaptcha: () => void;
  initializeRecaptcha: () => void;
}

declare global {
  interface Window {
    grecaptcha: {
      render: (container: string | HTMLElement, options: any) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
      execute: (widgetId?: number) => void;
    };
  }
}

export function useRecaptchaV2(siteKey: string): RecaptchaV2Hook {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  const initializeRecaptcha = useCallback(() => {
    if (!siteKey || !containerRef.current) {
      console.warn('reCAPTCHA not initialized: missing site key or container');
      return;
    }

    // Check if grecaptcha is loaded
    if (typeof window === 'undefined' || !window.grecaptcha) {
      console.warn('reCAPTCHA not loaded: grecaptcha script not found');
      return;
    }

    try {
      // Clear any existing widget
      if (widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
      }

      // Render new widget
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        size: 'normal',
      });
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
    }
  }, [siteKey]);

  const getToken = useCallback((): string | null => {
    if (typeof window === 'undefined' || !window.grecaptcha || widgetIdRef.current === null) {
      return null;
    }

    try {
      return window.grecaptcha.getResponse(widgetIdRef.current);
    } catch (error) {
      console.error('Error getting reCAPTCHA token:', error);
      return null;
    }
  }, []);

  const resetCaptcha = useCallback(() => {
    if (typeof window === 'undefined' || !window.grecaptcha || widgetIdRef.current === null) {
      return;
    }

    try {
      window.grecaptcha.reset(widgetIdRef.current);
    } catch (error) {
      console.error('Error resetting reCAPTCHA:', error);
    }
  }, []);

  return {
    containerRef,
    getToken,
    resetCaptcha,
    initializeRecaptcha,
  };
}
