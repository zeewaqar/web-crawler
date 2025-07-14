'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { apiBase } from '@/features/urls/api';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  urlId: number;
  initialStatus: 'queued' | 'running' | 'done' | 'error';
}

export function ProgressCell({ urlId, initialStatus }: Props) {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [pct, setPct] = useState<number | null>(
    initialStatus === 'done' ? 100
      : initialStatus === 'error' ? 0
      : null
  );

  useEffect(() => {
    // only listen while it's in-flight
    if (initialStatus === 'done' || initialStatus === 'error') return;

    const url = new URL(`${apiBase()}/api/v1/urls/${urlId}/stream`);
    if (token) url.searchParams.set('token', token);

    const es = new EventSource(url.toString());

    es.addEventListener('progress', (e: MessageEvent) => {
      const v = Number(e.data);
      if (v >= 100) {
        es.close();
        setPct(100);
        // **<-- invalidate the list so your table refetches**
        qc.invalidateQueries({ queryKey: ['urls'] });
      } else {
        setPct(v);
      }
    });

    es.onerror = () => {
      es.close();
      setPct(null);
    };

    return () => {
      es.close();
    };
  }, [urlId, initialStatus, token, qc]);

  if (initialStatus === 'done')
    return <span className="text-green-600">✅</span>;
  if (initialStatus === 'error')
    return <span className="text-red-600">❌</span>;
  if (pct === null) return <Skeleton className="h-3 w-20" />;

  return (
    <div className="flex items-center gap-2 w-28">
      <Progress value={pct} className="h-1 flex-1" />
      <span className="text-xs w-8 text-right">{pct}%</span>
    </div>
  );
}
