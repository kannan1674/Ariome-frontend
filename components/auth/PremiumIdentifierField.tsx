'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getPremiumFieldBorderClass,
  getPremiumFieldLabelClass,
  premiumFieldLabelClass,
  premiumFieldShellClass,
} from '@/components/auth/premiumFieldStyles';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { countryDialLabel, countryFlagEmoji } from '@/lib/i18n/countryFlag';

type CountryOption = {
  Id?: string;
  Country?: string;
  DialDisplay?: string;
  Code?: string;
  iso2?: string;
  CountryCode?: string;
  dialCode?: string;
};

type PremiumIdentifierFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  label?: string;
  error?: boolean;
  identifierMode: 'email' | 'phone';
  countries: CountryOption[];
  selectedCountry?: CountryOption;
  onCountrySelect: (country: CountryOption) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
  className?: string;
};

export function PremiumIdentifierField({
  value,
  onChange,
  onBlur,
  name,
  id,
  label = 'Mobile or email',
  error = false,
  identifierMode,
  countries,
  selectedCountry,
  onCountrySelect,
  onKeyDown,
  onPaste,
  className,
}: PremiumIdentifierFieldProps) {
  const [focused, setFocused] = useState(false);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const active = focused || value.length > 0;
  const isEmail = identifierMode === 'email';
  const dial = countryDialLabel(selectedCountry);
  const flag = countryFlagEmoji(selectedCountry ?? { iso2: 'IN' });

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          premiumFieldShellClass,
          getPremiumFieldBorderClass(error, active),
        )}
      >
        <label
          htmlFor={id}
          className={cn(
            premiumFieldLabelClass,
            getPremiumFieldLabelClass(error, active),
          )}
        >
          {label}
        </label>
        <div className="flex h-[52px] items-stretch overflow-hidden rounded-[14px]">
          <Popover
            open={isEmail ? false : countryMenuOpen}
            onOpenChange={(next) => {
              if (isEmail) return;
              setCountryMenuOpen(next);
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={isEmail}
                aria-expanded={countryMenuOpen}
                aria-haspopup="listbox"
                aria-label="Select country"
                className={cn(
                  'flex shrink-0 items-center gap-1.5 border-r border-zinc-200 px-2.5 text-sm font-medium transition-colors',
                  isEmail
                    ? 'cursor-not-allowed bg-zinc-50 text-zinc-400'
                    : 'bg-white text-zinc-800 hover:bg-zinc-50',
                )}
              >
                <span className={cn('text-base leading-none', isEmail && 'grayscale opacity-50')} aria-hidden>
                  {flag}
                </span>
                {!isEmail && (
                  <ChevronDown
                    className={cn(
                      'size-3.5 text-zinc-500 transition-transform',
                      countryMenuOpen && 'rotate-180',
                    )}
                  />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="bottom"
              sideOffset={6}
              className="z-[300] max-h-60 w-72 overflow-y-auto border-zinc-200 p-1 shadow-lg"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              {countries.length > 0 ? (
                countries.map((country) => (
                  <button
                    key={country.Id}
                    type="button"
                    role="option"
                    className="flex w-full items-center gap-2.5 rounded-sm border-b border-zinc-100 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-zinc-50"
                    onClick={() => {
                      onCountrySelect(country);
                      setCountryMenuOpen(false);
                    }}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {countryFlagEmoji(country)}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium text-zinc-900">
                      {country.Country}
                    </span>
                    <span className="shrink-0 tabular-nums text-zinc-600">
                      {countryDialLabel(country)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-zinc-500">Loading country codes…</div>
              )}
            </PopoverContent>
          </Popover>

          {!isEmail ? (
            <span className="flex shrink-0 items-center border-r border-zinc-200 px-2.5 text-sm font-semibold tabular-nums text-zinc-800">
              {dial}
            </span>
          ) : null}

          <input
            id={id}
            name={name}
            type="text"
            inputMode={isEmail ? 'email' : 'numeric'}
            autoComplete={isEmail ? 'email' : 'tel'}
            maxLength={isEmail ? 254 : 10}
            value={value}
            placeholder={
              active ? (isEmail ? 'Enter your email' : 'Enter phone number') : ''
            }
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              onBlur?.();
            }}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            className="min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
        </div>
      </div>
    </div>
  );
}
