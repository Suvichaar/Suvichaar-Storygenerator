'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Loader2, RefreshCcw } from 'lucide-react';

import { fetchLogs } from '@/lib/api';
import { BackendLogEntry } from '@/lib/types';
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-zinc-300">{log.logger}</div>
          <div className="text-[11px] text-zinc-500">{new Date(log.timestamp).toLocaleString()}</div>
        </div>
        <Badge variant="outline" className={levelClasses(log.level)}>
          {log.level}
        </Badge>
      </div>
      <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-200">
        {log.message}
      </pre>
    </div>
  );
}

export function LogViewer() {
  const [open, setOpen] = useState(false);

  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ['backend-logs'],
    queryFn: () => fetchLogs(200),
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
      <DialogContent className="max-w-5xl border-zinc-800 bg-zinc-950 p-0 text-zinc-100">
        <DialogHeader className="border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle>Backend Logs</DialogTitle>
              <DialogDescription className="mt-1 text-zinc-400">
                Recent structured logs from the running news backend service.
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
            <ScrollArea className="h-[65vh] pr-4">
              <div className="space-y-3">
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
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
