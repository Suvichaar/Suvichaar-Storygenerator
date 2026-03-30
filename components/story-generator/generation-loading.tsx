'use client';

import { motion } from 'framer-motion';
import { Loader as Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface GenerationLoadingProps {
  step: 'uploading' | 'generating' | 'finalizing';
}

export function GenerationLoading({ step }: GenerationLoadingProps) {
  const steps = [
    { id: 'uploading', label: 'Uploading assets...' },
    { id: 'generating', label: 'Generating story...' },
    { id: 'finalizing', label: 'Finalizing...' },
  ];

  const currentIndex = steps.findIndex((s) => s.id === step);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
          <p className="text-lg font-medium text-zinc-200">
            {steps[currentIndex]?.label}
          </p>
        </div>

        <div className="flex items-center justify-between mb-2">
          {steps.map((s, index) => (
            <div
              key={s.id}
              className="flex-1 flex items-center"
            >
              <div
                className={`w-full h-1 rounded-full transition-all ${
                  index <= currentIndex
                    ? 'bg-cyan-500'
                    : 'bg-zinc-700'
                }`}
              />
              {index < steps.length - 1 && (
                <div className="w-4" />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs text-zinc-500 mt-2">
          {steps.map((s) => (
            <span key={s.id}>{s.label}</span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-32 w-full bg-zinc-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full bg-zinc-800" />
          <Skeleton className="h-48 w-full bg-zinc-800" />
        </div>
      </div>
    </motion.div>
  );
}
