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
  Id: string;
  Country?: string;
  DialDisplay?: string;
  Code?: string;
  iso2?: string;
  CountryCode?: string;
  dialCode?: string;
};

type PremiumMobileFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  error?: boolean;
  countries: CountryOption[];
  selectedCountry?: CountryOption;
  onCountrySelect: (country: CountryOption) => void;
  countryDisabled?: boolean;
  /** Disables the national-number input (e.g. profile view / locked phone). */
  inputDisabled?: boolean;
  maxLength?: number;
  className?: string;
};

export function PremiumMobileField({
  value,
  onChange,
  onBlur,
  name,
  id,
  label = 'Mobile number',
  placeholder = 'Enter phone number',
  error = false,
  countries,
  selectedCountry,
  onCountrySelect,
  countryDisabled = false,
  inputDisabled = false,
  maxLength = 10,
  className,
}: PremiumMobileFieldProps) {
  const [focused, setFocused] = useState(false);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const active = focused || value.length > 0 || inputDisabled;
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
            open={countryDisabled ? false : countryMenuOpen}
            onOpenChange={(next) => {
              if (countryDisabled) return;
              setCountryMenuOpen(next);
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={countryDisabled}
                aria-expanded={countryMenuOpen}
                aria-haspopup="listbox"
                aria-label="Select country"
                className={cn(
                  'flex shrink-0 items-center gap-1.5 border-r border-zinc-200 px-2.5 text-sm font-medium transition-colors',
                  countryDisabled
                    ? 'cursor-not-allowed bg-zinc-50 text-zinc-400'
                    : 'bg-white text-zinc-800 hover:bg-zinc-50',
                )}
              >
                <span className="text-base leading-none" aria-hidden>
                  {flag}
                </span>
                {!countryDisabled && (
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
                <div className="px-3 py-2 text-sm text-zinc-500">Loading…</div>
              )}
            </PopoverContent>
          </Popover>

          <span
            className="flex shrink-0 items-center border-r border-zinc-200 px-2.5 text-sm font-semibold tabular-nums text-zinc-800"
            aria-hidden={!selectedCountry}
          >
            {dial}
          </span>

          <input
            id={id}
            name={name}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={maxLength}
            value={value}
            placeholder={active ? placeholder : ''}
            disabled={inputDisabled}
            readOnly={inputDisabled}
            onChange={(e) => {
              if (inputDisabled) return;
              onChange(e.target.value.replace(/\D/g, '').slice(0, maxLength));
            }}
            onFocus={() => {
              if (inputDisabled) return;
              setFocused(true);
            }}
            onBlur={() => {
              setFocused(false);
              onBlur?.();
            }}
            className={cn(
              'min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400',
              inputDisabled && 'cursor-default text-zinc-700',
            )}
          />
        </div>
      </div>
    </div>
  );
}
