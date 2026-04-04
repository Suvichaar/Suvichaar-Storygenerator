'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Loader2, RefreshCcw } from 'lucide-react';

import { fetchLogs } from '@/lib/api';
import { BackendLogEntry, StoryMode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function levelClasses(level: string): string {
  switch (level) {
    case 'ERROR':
      return 'border-red-500/30 bg-red-500/10 text-red-300';
    case 'WARNING':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
    case 'INFO':
      return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';
    default:
      return 'border-zinc-700 bg-zinc-800 text-zinc-300';
  }
}

function LogRow({ log }: { log: BackendLogEntry }) {
  return (
    <div className="w-full max-w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
      <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-zinc-300">{log.logger}</div>
          <div className="text-[11px] text-zinc-500">{new Date(log.timestamp).toLocaleString()}</div>
        </div>
        <Badge variant="outline" className={levelClasses(log.level)}>
          {log.level}
        </Badge>
      </div>
      <div
        className="w-full max-w-full overflow-hidden font-mono text-xs leading-5 text-zinc-200 whitespace-pre-wrap [overflow-wrap:anywhere]"
      >
        {log.message}
      </div>
    </div>
  );
}

export function LogViewer({ mode }: { mode: StoryMode }) {
  const [open, setOpen] = useState(false);

  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ['backend-logs', mode],
    queryFn: () => fetchLogs(mode, 200),
    enabled: open,
    refetchInterval: open ? 3000 : false,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
        >
          <FileText className="mr-2 h-4 w-4" />
          Logs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl overflow-hidden border-zinc-800 bg-zinc-950 p-0 text-zinc-100">
        <DialogHeader className="border-b border-zinc-800 px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <DialogTitle>Backend Logs</DialogTitle>
              <DialogDescription className="mt-1 text-zinc-400">
                Recent structured logs from the running {mode} backend service.
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
            >
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="mb-4 flex items-center gap-3 text-sm text-zinc-400">
            <span>Showing latest {data?.count ?? 0} logs</span>
            <span className="text-zinc-600">•</span>
            <span>Buffered {data?.total_buffered ?? 0}</span>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">
              {error instanceof Error ? error.message : 'Failed to load logs'}
            </div>
          ) : (
            <div className="h-[65vh] w-full max-w-full overflow-x-hidden overflow-y-auto pr-4">
              <div className="w-full min-w-0 max-w-full space-y-3">
                {data?.logs.length ? (
                  data.logs
                    .slice()
                    .reverse()
                    .map((log, index) => <LogRow key={`${log.timestamp}-${index}`} log={log} />)
                ) : (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-400">
                    {isFetching ? 'Loading logs...' : 'No logs available yet.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
