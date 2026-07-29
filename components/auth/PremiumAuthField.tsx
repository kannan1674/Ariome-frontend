'use client';

import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getPremiumFieldBorderClass,
  getPremiumFieldLabelClass,
  premiumFieldInputClass,
  premiumFieldLabelClass,
  premiumFieldShellClass,
} from '@/components/auth/premiumFieldStyles';

type PremiumAuthFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  label: string;
  placeholder?: string;
  error?: boolean;
  valid?: boolean;
  className?: string;
  inputClassName?: string;
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  showPasswordToggle?: boolean;
  rightAdornment?: ReactNode;
  onKeyDown?: InputHTMLAttributes<HTMLInputElement>['onKeyDown'];
  onPaste?: InputHTMLAttributes<HTMLInputElement>['onPaste'];
};

export function PremiumAuthField({
  value,
  onChange,
  onBlur,
  name,
  id,
  label,
  placeholder,
  error = false,
  valid = false,
  className,
  inputClassName,
  type = 'text',
  autoComplete,
  inputMode,
  maxLength,
  showPasswordToggle = false,
  rightAdornment,
  onKeyDown,
  onPaste,
}: PremiumAuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  const isPassword = type === 'password' || showPasswordToggle;
  const inputType = isPassword && !visible ? 'password' : isPassword ? 'text' : type;
  const hasRight = Boolean(rightAdornment || showPasswordToggle);

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          premiumFieldShellClass,
          getPremiumFieldBorderClass(error, active, valid),
        )}
      >
        <label
          htmlFor={id}
          className={cn(
            premiumFieldLabelClass,
            getPremiumFieldLabelClass(error, active, valid),
          )}
        >
          {label}
        </label>
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={active ? placeholder : ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          className={cn(
            premiumFieldInputClass,
            hasRight && 'pr-12',
            inputClassName,
          )}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
        {rightAdornment}
      </div>
    </div>
  );
}
