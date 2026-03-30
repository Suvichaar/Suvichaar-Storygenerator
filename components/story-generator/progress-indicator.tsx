'use client';

import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressIndicator({
  current,
  total,
  className,
}: ProgressIndicatorProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">
          Slide {current} of {total}
        </span>
        <span className="text-zinc-500">{Math.round(percentage)}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
