'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type PremiumDateFilterProps = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
};

export function PremiumDateFilter({
  value,
  onChange,
  placeholder = 'Choose your date',
  className,
}: PremiumDateFilterProps) {
  const [open, setOpen] = useState(false);
  const label = value ? format(value, 'dd MMM yyyy') : placeholder;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex h-11 min-w-[220px] items-center gap-2 rounded-full px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition',
              'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2',
            )}
          >
            <CalendarIcon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-left">{label}</span>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 transition-transform',
                open && 'rotate-180',
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="z-[80] w-auto overflow-hidden rounded-[22px] border-0 p-0 shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
        >
          <div className="premium-date-filter">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(day) => {
                onChange(day);
                setOpen(false);
              }}
              className="p-3 pt-2"
              classNames={{
                month_caption:
                  'relative z-20 mx-0 mb-3 flex h-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 px-12 text-white',
                caption_label: 'text-sm font-bold tracking-wide text-white',
                nav: 'absolute inset-x-0 top-0 z-30 flex h-12 w-full items-center justify-between px-2',
                button_previous:
                  'inline-flex size-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white',
                button_next:
                  'inline-flex size-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white',
                weekday: 'size-9 p-0 text-[11px] font-semibold uppercase text-slate-400',
                day: 'group size-9 px-0 py-px text-sm',
                day_button:
                  'relative flex size-9 items-center justify-center rounded-xl p-0 text-slate-800 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 group-data-selected:bg-blue-600 group-data-selected:text-white group-data-selected:shadow-md group-data-outside:text-slate-300 group-data-disabled:text-slate-300',
                today:
                  '*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-blue-500 group-data-selected:*:after:bg-white',
              }}
            />
          </div>
        </PopoverContent>
      </Popover>

      {value ? (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          aria-label="Clear date filter"
          title="Clear date"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
