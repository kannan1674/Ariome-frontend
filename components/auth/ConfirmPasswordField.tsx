'use client';

import { PremiumAuthField } from '@/components/auth/PremiumAuthField';

type ConfirmPasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  error?: boolean;
  className?: string;
};

export function ConfirmPasswordField({
  value,
  onChange,
  onBlur,
  name,
  id,
  label = 'Confirm password',
  placeholder = 'Repeat password',
  error = false,
  className,
}: ConfirmPasswordFieldProps) {
  return (
    <PremiumAuthField
      id={id}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      autoComplete="new-password"
      error={error}
      showPasswordToggle
      className={className}
    />
  );
}
