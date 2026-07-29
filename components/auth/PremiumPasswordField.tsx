'use client';

import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumAuthField } from '@/components/auth/PremiumAuthField';
import {
  getPasswordRuleStates,
  getPasswordStrength,
  strengthBarColor,
  strengthLabel,
  strengthProgress,
  strengthTextColor,
} from '@/lib/auth/passwordStrength';

type PremiumPasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: boolean;
  showStrength?: boolean;
  className?: string;
};

export function PremiumPasswordField({
  value,
  onChange,
  onBlur,
  name,
  id,
  label = 'Password',
  placeholder = 'Enter password',
  autoComplete = 'new-password',
  error = false,
  showStrength = true,
  className,
}: PremiumPasswordFieldProps) {
  const rules = useMemo(() => getPasswordRuleStates(value), [value]);
  const strength = useMemo(() => getPasswordStrength(value), [value]);
  const progress = strengthProgress(strength);
  const allValid = rules.every((r) => r.valid);

  return (
    <div className={cn('space-y-3', className)}>
      <PremiumAuthField
        id={id}
        name={name}
        label={label}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        error={error}
        valid={allValid && value.length > 0}
        showPasswordToggle
      />

      {showStrength && value.length > 0 && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-zinc-600">Password Strength</span>
              <span className={cn('font-semibold', strengthTextColor(strength))}>
                {strengthLabel(strength)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-400 ease-out',
                  strengthBarColor(strength),
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className={cn(
                  'inline-flex items-center gap-1.5 transition-colors',
                  rule.valid ? 'text-emerald-600' : 'text-red-500',
                )}
              >
                {rule.valid ? (
                  <Check className="size-3.5 shrink-0 stroke-[2.5]" />
                ) : (
                  <X className="size-3.5 shrink-0 stroke-[2.5]" />
                )}
                {rule.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
