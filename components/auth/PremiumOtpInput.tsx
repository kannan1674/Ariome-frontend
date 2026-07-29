'use client';

import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type PremiumOtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
};

export function PremiumOtpInput({
  value,
  onChange,
  length = 6,
  error = false,
  disabled = false,
  autoFocus = true,
  className,
}: PremiumOtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  const focusIndex = useCallback((index: number) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const updateValue = useCallback(
    (next: string) => {
      onChange(next.replace(/\D/g, '').slice(0, length));
    },
    [length, onChange],
  );

  useEffect(() => {
    if (autoFocus && !disabled) {
      focusIndex(0);
    }
  }, [autoFocus, disabled, focusIndex]);

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    const chars = value.padEnd(length, ' ').slice(0, length).split('');
    chars[index] = digit || ' ';
    const next = chars.join('').replace(/\s/g, '');
    updateValue(next);
    if (digit && index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = value.padEnd(length, ' ').slice(0, length).split('');
      if (chars[index]?.trim()) {
        chars[index] = ' ';
        updateValue(chars.join('').replace(/\s/g, ''));
      } else if (index > 0) {
        focusIndex(index - 1);
        const prev = value.padEnd(length, ' ').slice(0, length).split('');
        prev[index - 1] = ' ';
        updateValue(prev.join('').replace(/\s/g, ''));
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    updateValue(pasted);
    focusIndex(Math.min(pasted.length, length - 1));
  };

  return (
    <div
      className={cn(
        'mx-auto grid w-full max-w-[min(100%,320px)] grid-cols-6 gap-1.5 sm:max-w-[360px] sm:gap-2.5',
        className,
      )}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={digit.trim()}
          aria-label={`Digit ${index + 1}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'aspect-square w-full min-h-[2.75rem] max-h-12 rounded-lg border bg-[#141c2e]/90 text-center text-base font-semibold text-white outline-none transition-all sm:rounded-xl sm:text-lg',
            error
              ? 'border-red-400/80 ring-2 ring-red-500/25'
              : 'border-teal-400/30 focus:border-fuchsia-400/70 focus:ring-2 focus:ring-fuchsia-500/30',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        />
      ))}
    </div>
  );
}
