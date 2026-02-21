'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = 'Select a date' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(`${value}T12:00:00`) : undefined;

  const displayValue = selected
    ? selected.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {/* Input trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-left focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all bg-white"
      >
        <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
      </button>

      {/* Calendar popover */}
      {open && (
        <div className="absolute z-50 mt-2 rounded-xl border border-gray-200 bg-white shadow-xl shadow-purple-900/10 p-4">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected ?? new Date()}
            classNames={{
              root: 'w-[280px]',
              months: '',
              month: '',
              month_caption: 'flex items-center justify-between mb-3 px-1',
              caption_label: 'text-sm font-semibold text-gray-900',
              nav: 'flex items-center gap-1',
              button_previous: 'p-1.5 rounded-lg hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-colors',
              button_next: 'p-1.5 rounded-lg hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-colors',
              weeks: '',
              week: 'flex',
              weekdays: 'flex mb-1',
              weekday: 'w-9 text-center text-xs font-medium text-gray-400 py-1',
              day: 'w-9 h-9 flex items-center justify-center',
              day_button: 'w-8 h-8 rounded-lg text-sm flex items-center justify-center hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer text-gray-700',
              selected: '[&>button]:bg-purple-600 [&>button]:text-white [&>button]:hover:bg-purple-700 [&>button]:hover:text-white',
              today: '[&>button]:font-bold [&>button]:text-purple-600',
              outside: '[&>button]:text-gray-300',
              disabled: '[&>button]:text-gray-200 [&>button]:cursor-not-allowed',
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === 'left'
                  ? <ChevronLeft className="h-4 w-4" />
                  : <ChevronRight className="h-4 w-4" />,
            }}
          />
        </div>
      )}
    </div>
  );
}
