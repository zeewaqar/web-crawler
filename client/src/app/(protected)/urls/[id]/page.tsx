"use client";

import {useEffect, useState, useCallback, useMemo} from "react";
import {fetchUrlDetail} from "@/features/urls/api";
import {LinkTypeChart} from "@/features/urls/components/LinkTypeChart";
import {BrokenLinkList} from "@/features/urls/components/BrokenLinkList";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {useNavigation} from "@/components/ui/Nav";
import type {UrlDetail} from "@/features/urls/api";
import {
  Globe,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle,
  FileText,
  Hash,
  User,
  Calendar,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import {useParams} from "next/navigation";

// Stats Card Component
const StatsCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color = "blue",
  trend,
}: {
  icon: React.ComponentType<{className?: string}>;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "blue" | "green" | "red" | "yellow" | "purple";
  trend?: string;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    red: "bg-red-50 text-red-600 border-red-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]} shadow-sm`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// URL Header Component
const UrlHeader = ({data}: {data: UrlDetail}) => {
  let domain = "";
  try {
    domain = new URL(data.original_url).hostname;
  } catch {
    domain = "Invalid URL";
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-200">
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                URL Analysis Report
              </h1>
              <a
                href={data.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-blue-100 rounded-md transition-colors"
                title="Open original URL">
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </a>
            </div>
            <p className="text-sm text-blue-800 bg-blue-100 px-3 py-1 rounded-full inline-block mb-3 font-medium">
              {data.original_url}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {domain}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Analyzed on {new Date(data.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Page Metadata Component
const PageMetadata = ({data}: {data: UrlDetail}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Page Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">HTML Version</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {data.html_version || "Unknown"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Login Form</span>
              </div>
              <span
                className={`text-sm px-2 py-1 rounded-full font-medium ${
                  data.has_login
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                {data.has_login ? "Present" : "None"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Heading Structure</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {data.h1}
                  </div>
                  <div className="text-xs text-gray-500">H1</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {data.h2}
                  </div>
                  <div className="text-xs text-gray-500">H2</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {data.h3}
                  </div>
                  <div className="text-xs text-gray-500">H3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Link Charts Section
const LinkAnalysisSection = ({data}: {data: UrlDetail}) => {
  const totalLinks = data.internal_links + data.external_links;
  const brokenLinks = data.links.filter(
    (l) => l.http_status !== null && l.http_status >= 400
  );
  const healthyLinks = totalLinks - brokenLinks.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Link Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <LinkTypeChart
              internal={data.internal_links}
              external={data.external_links}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {data.internal_links}
              </div>
              <div className="text-sm text-gray-600">Internal Links</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {data.external_links}
              </div>
              <div className="text-sm text-gray-600">External Links</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Link Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Healthy Links
                </span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {healthyLinks}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Broken Links</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {brokenLinks.length}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Health Score</span>
                <span>{Math.round((healthyLinks / totalLinks) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(healthyLinks / totalLinks) * 100}%`,
                  }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function UrlDetailPage() {
  const params = useParams();
  const [data, setData] = useState<UrlDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const id = params.id;

  const loadData = useCallback(async (id: number) => {
    try {
      const result = await fetchUrlDetail(id);
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch URL details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load URL details"
      );
    }
  }, []);

  // Memoize refresh handler
  const handleRefresh = useCallback(async () => {
    if (!data) return;

    setRefreshing(true);
    try {
      await loadData(data.id);
    } finally {
      setRefreshing(false);
    }
  }, [data, loadData]);

  // Get page title from URL domain
  const getPageTitle = useCallback((url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace("www.", "");
    } catch {
      return "URL Analysis";
    }
  }, []);

  // Memoize nav data to prevent infinite loops
  const pageTitle = useMemo(
    () => (data ? getPageTitle(data.original_url) : undefined),
    [data, getPageTitle]
  );

  const navData = useMemo(
    () => ({
      pageTitle,
      onRefresh: handleRefresh,
      isLoading: refreshing,
    }),
    [pageTitle, handleRefresh, refreshing]
  );

  // Register navigation data
  useNavigation(navData);

  useEffect(() => {
    const parsedId = Number(id);

    if (Number.isNaN(parsedId) || parsedId <= 0) {
      setError("Invalid URL ID");
      setLoading(false);
      return;
    }

    loadData(parsedId).finally(() => setLoading(false));
  }, [id, loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="h-80 bg-gray-200 rounded-lg"></div>
                <div className="h-80 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">No Data</h1>
              <p className="text-gray-600">No URL details found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalLinks = data.internal_links + data.external_links;
  const brokenLinks = data.links.filter(
    (l) => l.http_status !== null && l.http_status >= 400
  );
  const healthyLinks = totalLinks - brokenLinks.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <UrlHeader data={data} />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              icon={LinkIcon}
              title="Total Links"
              value={totalLinks}
              subtitle="Links discovered"
              color="blue"
            />
            <StatsCard
              icon={CheckCircle}
              title="Healthy Links"
              value={healthyLinks}
              subtitle="Working properly"
              color="green"
              trend={`${Math.round(
                (healthyLinks / totalLinks) * 100
              )}% healthy`}
            />
            <StatsCard
              icon={AlertTriangle}
              title="Broken Links"
              value={brokenLinks.length}
              subtitle="Need attention"
              color="red"
            />
            <StatsCard
              icon={FileText}
              title="Headings"
              value={data.h1 + data.h2 + data.h3}
              subtitle="Total structure"
              color="purple"
            />
          </div>

          {/* Link Analysis Section */}
          <div className="mb-8">
            <LinkAnalysisSection data={data} />
          </div>

          {/* Broken Links Details */}
          <div className="mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Broken Links Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-y-auto">
                  {" "}
                  {/* Add this wrapper div */}
                  <BrokenLinkList links={brokenLinks} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Page Metadata */}
          <PageMetadata data={data} />
        </div>
      </div>
    </div>
  );
}
