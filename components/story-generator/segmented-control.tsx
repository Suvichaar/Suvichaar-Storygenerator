'use client';

import { cn } from '@/lib/utils';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name,
}: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-all',
            'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-950',
            value === option.value
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          )}
          aria-pressed={value === option.value}
          aria-label={`${name}: ${option.label}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
