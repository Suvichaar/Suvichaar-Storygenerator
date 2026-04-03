'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { fetchPromptManagement } from '@/lib/api';
import { StoryMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LogViewer } from './log-viewer';

interface NavigationProps {
  environment?: string;
  mode: StoryMode;
}

export function Navigation({ environment = 'DEVELOPMENT', mode }: NavigationProps) {
  const envConfig = {
    PRODUCTION: { color: 'bg-emerald-500', text: 'PROD' },
    STAGING: { color: 'bg-amber-500', text: 'STAGING' },
    DEVELOPMENT: { color: 'bg-cyan-500', text: 'DEV' },
  };

  const config = envConfig[environment as keyof typeof envConfig] || envConfig.DEVELOPMENT;
  const promptsQuery = useQuery({
    queryKey: ['prompt-management', mode],
    queryFn: () => fetchPromptManagement(mode),
  });

  const activePromptBadges = useMemo(() => {
    if (!promptsQuery.data) {
      return [];
    }

    return [...promptsQuery.data.text_prompts, ...promptsQuery.data.image_prompts]
      .map((family) => family.versions.find((version) => version.is_active))
      .filter((version): version is NonNullable<typeof version> => Boolean(version))
      .map((version) => ({
        label: `${version.key}:${version.version}`,
        group: version.group === 'text_prompts' ? 'Text' : 'Image',
      }));
  }, [promptsQuery.data]);

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
              <p className="text-xs text-zinc-500">{mode === 'news' ? 'News Service' : 'Curious Service'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">
                {mode === 'news' ? 'News prompts' : 'Curious prompts'}
              </span>
              {promptsQuery.isLoading ? (
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  Loading...
                </Badge>
              ) : promptsQuery.error ? (
                <Badge variant="outline" className="border-red-900 text-red-300">
                  Prompt fetch failed
                </Badge>
              ) : activePromptBadges.length > 0 ? (
                activePromptBadges.map((item) => (
                  <Badge
                    key={`${item.group}-${item.label}`}
                    variant="outline"
                    className="border-cyan-800 bg-cyan-950/40 text-cyan-200"
                  >
                    {item.group} {item.label}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  No active prompt
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              {mode === 'news' ? 'News Mode' : 'Curious Mode'}
            </Badge>
            <LogViewer mode={mode} />
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
