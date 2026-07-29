'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type PremiumRememberCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  id?: string;
};

export function PremiumRememberCheckbox({
  checked,
  onCheckedChange,
  label = 'Remember me',
  className,
  id = 'remember-me',
}: PremiumRememberCheckboxProps) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'group flex cursor-pointer select-none items-center gap-3.5 text-[15px] font-semibold text-zinc-800',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-[28px] shrink-0 items-center justify-center rounded-[10px] border-2 transition-all duration-200',
          checked
            ? 'border-emerald-500 bg-[#22c55e] text-white shadow-[0_6px_16px_rgba(34,197,94,0.28)]'
            : 'border-zinc-300 bg-white text-transparent shadow-sm group-hover:border-emerald-400',
        )}
      >
        <Check
          className={cn(
            'size-4 stroke-[3] transition-transform duration-200',
            checked ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
          )}
          aria-hidden
        />
      </span>
      <span>{label}</span>
    </button>
  );
}
