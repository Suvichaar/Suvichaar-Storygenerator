'use client';

import { motion } from 'framer-motion';
import { GeneratedStory } from '@/lib/types';
import { Copy, ExternalLink, Download, RefreshCcw, CircleCheck as CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ResultPanelProps {
  story: GeneratedStory;
  onGenerateAnother: () => void;
}

export function ResultPanel({ story, onGenerateAnother }: ResultPanelProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">
                Story Generated Successfully
              </h3>
              <p className="text-sm text-zinc-500">Created just now</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <span className="text-sm text-zinc-400">ID:</span>
          <code className="text-sm text-cyan-400 font-mono flex-1">
            {story.id}
          </code>
          <button
            onClick={() => copyToClipboard(story.id, 'Story ID')}
            className="p-1.5 hover:bg-zinc-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Copy story ID"
          >
            <Copy className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-4">
          <h4 className="text-base font-semibold text-zinc-100">
            Published URLs
          </h4>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Primary URL</label>
              <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <code className="text-xs text-zinc-300 flex-1 truncate">
                  {story.primaryUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(story.primaryUrl, 'URL')}
                  className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
                  aria-label="Copy primary URL"
                >
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                </button>
                <a
                  href={story.primaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
                  aria-label="Open primary URL"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">HTML URL</label>
              <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <code className="text-xs text-zinc-300 flex-1 truncate">
                  {story.htmlUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(story.htmlUrl, 'HTML URL')}
                  className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
                  aria-label="Copy HTML URL"
                >
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                </button>
                <a
                  href={story.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
                  aria-label="Open HTML URL"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-4">
          <h4 className="text-base font-semibold text-zinc-100">
            Story Metadata
          </h4>

          <dl className="space-y-3">
            {[
              { label: 'Mode', value: story.mode },
              { label: 'Template', value: story.template },
              { label: 'Category', value: story.category },
              { label: 'Slide Count', value: story.slideCount },
              { label: 'Language', value: story.language },
              { label: 'Voice Engine', value: story.voiceEngine },
              { label: 'Background Source', value: story.backgroundSource },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
              >
                <dt className="text-sm text-zinc-400">{item.label}</dt>
                <dd className="text-sm text-zinc-200 font-medium">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-4">
        <h4 className="text-base font-semibold text-zinc-100">Slide Preview</h4>

        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
          {story.slides.map((slide) => (
            <div
              key={slide.number}
              className="flex-shrink-0 w-72 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400">
                  Slide {slide.number}
                </span>
                {slide.imageUrl && (
                  <ImageIcon className="w-4 h-4 text-zinc-500" />
                )}
              </div>

              {slide.imageUrl && (
                <div className="aspect-video rounded-md bg-zinc-900 overflow-hidden">
                  <img
                    src={slide.imageUrl}
                    alt={`Slide ${slide.number}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <p className="text-sm text-zinc-300 line-clamp-4">
                {slide.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => window.open(story.htmlUrl, '_blank')}
          variant="outline"
          className="flex-1 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download HTML
        </Button>
        <Button
          onClick={onGenerateAnother}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Generate Another
        </Button>
      </div>
    </motion.div>
  );
}
