'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogViewer } from './log-viewer';

interface NavigationProps {
  environment?: string;
}

export function Navigation({ environment = 'DEVELOPMENT' }: NavigationProps) {
  const envConfig = {
    PRODUCTION: { color: 'bg-emerald-500', text: 'PROD' },
    STAGING: { color: 'bg-amber-500', text: 'STAGING' },
    DEVELOPMENT: { color: 'bg-cyan-500', text: 'DEV' },
  };

  const config = envConfig[environment as keyof typeof envConfig] || envConfig.DEVELOPMENT;

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-100">Story Generator</h1>
              <p className="text-xs text-zinc-500">AI-Powered Web Stories</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LogViewer />
            <div
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold text-white',
                config.color
              )}
            >
              {config.text}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
