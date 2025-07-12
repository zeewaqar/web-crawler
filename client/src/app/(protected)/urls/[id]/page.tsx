// src/app/(protected)/urls/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { fetchUrlDetail } from "@/features/urls/api";
import { LinkTypeChart } from "@/features/urls/components/LinkTypeChart";
import { BrokenLinkList } from "@/features/urls/components/BrokenLinkList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import type { UrlDetail } from "@/features/urls/api";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function UrlDetailPage({ params }: PageProps) {
  const [data, setData] = useState<UrlDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [id, setId] = useState<number | null>(null);

  useEffect(() => {
    // Unwrap the params Promise
    params.then((resolvedParams) => {
      const parsedId = Number(resolvedParams.id);
      setId(parsedId);
      
      if (Number.isNaN(parsedId) || parsedId <= 0) {
        setError('Invalid URL ID');
        setLoading(false);
        return;
      }

      fetchUrlDetail(parsedId)
        .then(setData)
        .catch((err) => {
          console.error('Failed to fetch URL details:', err);
          setError(err instanceof Error ? err.message : 'Failed to load URL details');
        })
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading URL details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-semibold mb-2">Error</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="p-6">
        <div className="text-center text-gray-600">
          <h1 className="text-2xl font-semibold mb-2">No Data</h1>
          <p>No URL details found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold break-all">
        {data.original_url}
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Link Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <LinkTypeChart
              internal={data.internal_links}
              external={data.external_links}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Broken Links</CardTitle>
          </CardHeader>
          <CardContent>
            <BrokenLinkList
              links={data.links.filter(
                (l) => l.http_status !== null && l.http_status >= 400
              )}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>HTML Version:</strong>{" "}
            {data.html_version ?? "unknown"}
          </p>
          <p>
            <strong>Headings:</strong>{" "}
            h1={data.h1} h2={data.h2} h3={data.h3}
          </p>
          <p>
            <strong>Login form:</strong>{" "}
            {data.has_login ? "yes" : "no"}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}