'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart3, FileText, GitBranch, DollarSign, TrendingUp,
  ExternalLink, MousePointerClick, Eye, Coins,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────

interface OverviewData {
  content_plans: number;
  funnels: number;
  month_cost: number;
  budget: number;
  top_platform: { platform: string; count: number };
}

interface ChartEntry {
  date: string;
  sonar: number;
  haiku: number;
  other: number;
  total: number;
}

interface TableRow {
  date: string;
  model: string;
  total_cost: number;
  total_input: number;
  total_output: number;
  requests: number;
}

interface ModelBreakdown {
  model: string;
  provider: string;
  total_cost: number;
  total_input: number;
  total_output: number;
  requests: number;
}

interface AnalyticsData {
  overview: OverviewData;
  chart: ChartEntry[];
  table: TableRow[];
  model_breakdown: ModelBreakdown[];
}

// ── Mock data for Content Performance ──────────────────────────

const MOCK_CONTENT = [
  { title: 'AI Replaced My Job in 30 Days', platform: 'TikTok', date: '2026-02-24', views: 145200, clicks: 3420, revenue: 89.50 },
  { title: 'Crypto Bot That Actually Works', platform: 'YT Shorts', date: '2026-02-23', views: 89400, clicks: 2180, revenue: 156.20 },
  { title: '5 AI Tools for Passive Income', platform: 'IG Reels', date: '2026-02-22', views: 67800, clicks: 1890, revenue: 72.30 },
  { title: 'Vibe Coding Challenge', platform: 'Threads', date: '2026-02-21', views: 34500, clicks: 890, revenue: 23.10 },
  { title: 'Build SaaS with Claude', platform: 'Twitter', date: '2026-02-20', views: 23100, clicks: 670, revenue: 45.80 },
  { title: 'Free Hosting Hack 2026', platform: 'TikTok', date: '2026-02-19', views: 198300, clicks: 5610, revenue: 234.50 },
  { title: 'NordVPN vs Competitors', platform: 'YT Shorts', date: '2026-02-18', views: 56700, clicks: 1340, revenue: 178.90 },
];

// ── Mock data for Affiliate Tracking ───────────────────────────

const MOCK_AFFILIATES = [
  { name: 'Bybit', niche: 'crypto', clicks: 4520, conversions: 89, revenue: 1245.00, cr: 1.97 },
  { name: 'Hostinger', niche: 'hosting', clicks: 3210, conversions: 156, revenue: 890.40, cr: 4.86 },
  { name: 'NordVPN', niche: 'vpn', clicks: 2890, conversions: 201, revenue: 1567.80, cr: 6.95 },
  { name: 'Skillshare', niche: 'education', clicks: 1780, conversions: 67, revenue: 456.30, cr: 3.76 },
  { name: 'Cursor Pro', niche: 'ai_tools', clicks: 2340, conversions: 112, revenue: 672.00, cr: 4.79 },
  { name: 'Amazon Associates', niche: 'products', clicks: 5670, conversions: 234, revenue: 345.60, cr: 4.13 },
];

const NICHE_COLORS: Record<string, string> = {
  crypto: 'bg-yellow-500/20 text-yellow-400',
  hosting: 'bg-blue-500/20 text-blue-400',
  vpn: 'bg-purple-500/20 text-purple-400',
  education: 'bg-green-500/20 text-green-400',
  products: 'bg-orange-500/20 text-orange-400',
  ai_tools: 'bg-cyan-500/20 text-cyan-400',
  aggregator: 'bg-pink-500/20 text-pink-400',
};

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  youtube_shorts: 'YT Shorts',
  instagram_reels: 'IG Reels',
  threads: 'Threads',
  twitter: 'Twitter',
  none: '—',
};

function formatCost(v: number): string {
  return `$${v.toFixed(4)}`;
}

function formatNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toString();
}

// ── Overview Cards ─────────────────────────────────────────────

function OverviewCards({ data }: { data: OverviewData }) {
  const budgetPct = data.budget > 0 ? (data.month_cost / data.budget) * 100 : 0;

  const cards = [
    {
      label: 'Content Plans',
      value: data.content_plans.toString(),
      sub: 'total created',
      icon: FileText,
      color: 'text-[#4d8aff]',
    },
    {
      label: 'Active Funnels',
      value: data.funnels.toString(),
      sub: 'configured',
      icon: GitBranch,
      color: 'text-[#00e68a]',
    },
    {
      label: 'AI Costs (Month)',
      value: formatCost(data.month_cost),
      sub: `${budgetPct.toFixed(1)}% of $${data.budget} budget`,
      icon: DollarSign,
      color: budgetPct > 80 ? 'text-[#ff4d6a]' : 'text-[#00e68a]',
    },
    {
      label: 'Top Platform',
      value: PLATFORM_LABELS[data.top_platform.platform] ?? data.top_platform.platform,
      sub: `${data.top_platform.count} content plans`,
      icon: TrendingUp,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="border-white/5 bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-white/40">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <div className={`mt-2 text-2xl font-bold ${c.color}`}>{c.value}</div>
            <p className="mt-1 text-xs text-white/30">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── AI Costs Chart ─────────────────────────────────────────────

function AICostsChart({ data }: { data: ChartEntry[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) => [`$${Number(value).toFixed(4)}`, ''];

  return (
    <Card className="border-white/5 bg-white/[0.02]">
      <CardContent className="p-4">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">
          AI Costs — Last 30 Days
        </h3>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-white/20">
            No usage data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                tickFormatter={(v: string) => v.slice(5)} // MM-DD
                stroke="rgba(255,255,255,0.1)"
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                tickFormatter={(v) => `$${v}`}
                stroke="rgba(255,255,255,0.1)"
              />
              <Tooltip
                formatter={tooltipFormatter}
                contentStyle={{
                  background: '#12121a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                itemStyle={{ color: 'rgba(255,255,255,0.8)' }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}
              />
              <Bar dataKey="sonar" name="Sonar" stackId="a" fill="#4d8aff" radius={[0, 0, 0, 0]} />
              <Bar dataKey="haiku" name="Haiku" stackId="a" fill="#00e68a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="other" name="Other" stackId="a" fill="#ff4d6a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ── Model Breakdown Cards ──────────────────────────────────────

function ModelBreakdownSection({ data }: { data: ModelBreakdown[] }) {
  if (data.length === 0) return null;

  return (
    <Card className="border-white/5 bg-white/[0.02]">
      <CardContent className="p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/60">
          Model Breakdown (This Month)
        </h3>
        <div className="space-y-2">
          {data.map((m) => (
            <div key={m.model} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
              <div>
                <span className="font-mono text-sm text-white">{m.model}</span>
                <span className="ml-2 text-xs text-white/30">{m.provider}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-white/40">{m.requests} req</span>
                <span className="text-white/40">{formatNumber(m.total_input)} in / {formatNumber(m.total_output)} out</span>
                <span className="font-mono font-semibold text-[#00e68a]">{formatCost(m.total_cost)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── AI Usage Table ─────────────────────────────────────────────

function AICostsTable({ data }: { data: TableRow[] }) {
  if (data.length === 0) return null;

  return (
    <Card className="border-white/5 bg-white/[0.02]">
      <CardContent className="p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/60">
          Usage Log
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-white/40">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Model</th>
                <th className="pb-2 pr-4 text-right font-medium">Requests</th>
                <th className="pb-2 pr-4 text-right font-medium">Input Tokens</th>
                <th className="pb-2 pr-4 text-right font-medium">Output Tokens</th>
                <th className="pb-2 text-right font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={`${row.date}-${row.model}-${i}`} className="border-b border-white/[0.03] text-white/70">
                  <td className="py-2 pr-4 font-mono">{row.date}</td>
                  <td className="py-2 pr-4 font-mono">{row.model}</td>
                  <td className="py-2 pr-4 text-right">{row.requests}</td>
                  <td className="py-2 pr-4 text-right">{formatNumber(row.total_input)}</td>
                  <td className="py-2 pr-4 text-right">{formatNumber(row.total_output)}</td>
                  <td className="py-2 text-right font-mono text-[#00e68a]">{formatCost(row.total_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Content Performance (Mock) ─────────────────────────────────

function ContentPerformanceSection() {
  return (
    <Card className="border-white/5 bg-white/[0.02]">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Content Performance
          </h3>
          <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px]">Mock Data</Badge>
        </div>
        <p className="mb-3 text-xs text-white/20">
          Real data will connect via Genviral API &amp; OpenClaw integration.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-white/40">
                <th className="pb-2 pr-4 font-medium">Title</th>
                <th className="pb-2 pr-4 font-medium">Platform</th>
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 text-right font-medium">
                  <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> Views</span>
                </th>
                <th className="pb-2 pr-4 text-right font-medium">
                  <span className="inline-flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> Clicks</span>
                </th>
                <th className="pb-2 text-right font-medium">
                  <span className="inline-flex items-center gap-1"><Coins className="h-3 w-3" /> Revenue</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CONTENT.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.03] text-white/70">
                  <td className="max-w-[200px] truncate py-2 pr-4 font-medium text-white">{row.title}</td>
                  <td className="py-2 pr-4">
                    <Badge variant="outline" className="border-white/10 text-white/60 text-[10px]">
                      {row.platform}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4 font-mono text-white/40">{row.date}</td>
                  <td className="py-2 pr-4 text-right">{formatNumber(row.views)}</td>
                  <td className="py-2 pr-4 text-right">{formatNumber(row.clicks)}</td>
                  <td className="py-2 text-right font-mono text-[#00e68a]">${row.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Affiliate Tracking (Mock) ──────────────────────────────────

function AffiliateTrackingSection() {
  const totalRevenue = MOCK_AFFILIATES.reduce((s, a) => s + a.revenue, 0);

  return (
    <Card className="border-white/5 bg-white/[0.02]">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Affiliate Tracking
          </h3>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px]">Mock Data</Badge>
            <span className="font-mono text-sm font-bold text-[#00e68a]">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>
        <div className="space-y-2">
          {MOCK_AFFILIATES.map((a) => (
            <div key={a.name} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-3">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{a.name}</span>
                    <Badge className={`${NICHE_COLORS[a.niche] ?? 'bg-white/10 text-white/50'} text-[10px]`}>
                      {a.niche.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-white/40">
                    <span className="inline-flex items-center gap-1">
                      <MousePointerClick className="h-3 w-3" /> {formatNumber(a.clicks)} clicks
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> {a.conversions} conv
                    </span>
                    <span className={`font-semibold ${a.cr > 5 ? 'text-[#00e68a]' : a.cr > 3 ? 'text-yellow-400' : 'text-white/50'}`}>
                      {a.cr}% CR
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-bold text-[#00e68a]">${a.revenue.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      console.error('Analytics fetch error:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto mb-4 h-10 w-10 animate-pulse text-white/20" />
          <p className="text-sm text-white/30">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto mb-4 h-10 w-10 text-[#ff4d6a]" />
          <p className="text-sm text-[#ff4d6a]">Failed to load: {error}</p>
          <button onClick={() => { setLoading(true); fetchData(); }}
            className="mt-3 rounded bg-white/10 px-4 py-1.5 text-xs text-white/60 hover:bg-white/15">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const overview = data?.overview ?? {
    content_plans: 0, funnels: 0, month_cost: 0, budget: 30,
    top_platform: { platform: 'none', count: 0 },
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-[#4d8aff]" />
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
      </div>

      {/* 1. Overview Cards */}
      <OverviewCards data={overview} />

      {/* 2. AI Costs Chart */}
      <AICostsChart data={data?.chart ?? []} />

      {/* Model Breakdown */}
      <ModelBreakdownSection data={data?.model_breakdown ?? []} />

      {/* Usage Log Table */}
      <AICostsTable data={data?.table ?? []} />

      {/* 3. Content Performance (Mock) */}
      <ContentPerformanceSection />

      {/* 4. Affiliate Tracking (Mock) */}
      <AffiliateTrackingSection />
    </div>
  );
}
