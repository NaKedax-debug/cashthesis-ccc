import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface DailyCost {
  date: string;
  model: string;
  total_cost: number;
  total_input: number;
  total_output: number;
  requests: number;
}

interface UsageRow {
  date: string;
  model: string;
  provider: string;
  total_cost: number;
  total_input: number;
  total_output: number;
  requests: number;
}

interface CountRow {
  count: number;
}

interface PlatformRow {
  platform: string;
  count: number;
}

export async function GET() {
  try {
    const db = getDb();

    // 1) Overview stats
    const contentPlansCount = (
      db.prepare('SELECT COUNT(*) as count FROM content_plans').get() as CountRow
    ).count;

    const funnelsCount = (
      db.prepare('SELECT COUNT(*) as count FROM funnels').get() as CountRow
    ).count;

    const monthCost = (
      db.prepare(`
        SELECT COALESCE(SUM(cost_usd), 0) as count
        FROM api_usage
        WHERE timestamp >= datetime('now', 'start of month')
      `).get() as CountRow
    ).count;

    const budget = parseFloat(process.env.NEXT_PUBLIC_MONTHLY_BUDGET ?? '30');

    // Top platform by content count
    const platformRows = db.prepare(`
      SELECT platforms FROM content_plans
    `).all() as Array<{ platforms: string }>;

    const platformCounts: Record<string, number> = {};
    for (const row of platformRows) {
      try {
        const platforms = JSON.parse(row.platforms) as Array<{ platform: string }>;
        for (const p of platforms) {
          platformCounts[p.platform] = (platformCounts[p.platform] ?? 0) + 1;
        }
      } catch {
        // skip malformed
      }
    }

    let topPlatform: PlatformRow = { platform: 'none', count: 0 };
    for (const [platform, count] of Object.entries(platformCounts)) {
      if (count > topPlatform.count) {
        topPlatform = { platform, count };
      }
    }

    // 2) Daily cost breakdown (last 30 days)
    const dailyCosts = db.prepare(`
      SELECT
        date(timestamp) as date,
        model,
        provider,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COALESCE(SUM(input_tokens), 0) as total_input,
        COALESCE(SUM(output_tokens), 0) as total_output,
        COUNT(*) as requests
      FROM api_usage
      WHERE timestamp >= datetime('now', '-30 days')
      GROUP BY date(timestamp), model
      ORDER BY date(timestamp) ASC
    `).all() as UsageRow[];

    // Group by date for chart data
    const chartMap = new Map<string, { date: string; sonar: number; haiku: number; other: number; total: number }>();

    for (const row of dailyCosts) {
      if (!chartMap.has(row.date)) {
        chartMap.set(row.date, { date: row.date, sonar: 0, haiku: 0, other: 0, total: 0 });
      }
      const entry = chartMap.get(row.date)!;
      const cost = row.total_cost;

      if (row.model.includes('sonar')) {
        entry.sonar += cost;
      } else if (row.model.includes('haiku')) {
        entry.haiku += cost;
      } else {
        entry.other += cost;
      }
      entry.total += cost;
    }

    const chartData = Array.from(chartMap.values());

    // 3) Detailed usage table rows
    const tableData: DailyCost[] = dailyCosts.map((r) => ({
      date: r.date,
      model: r.model,
      total_cost: r.total_cost,
      total_input: r.total_input,
      total_output: r.total_output,
      requests: r.requests,
    }));

    // 4) Model breakdown totals
    const modelBreakdown = db.prepare(`
      SELECT
        model,
        provider,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COALESCE(SUM(input_tokens), 0) as total_input,
        COALESCE(SUM(output_tokens), 0) as total_output,
        COUNT(*) as requests
      FROM api_usage
      WHERE timestamp >= datetime('now', 'start of month')
      GROUP BY model
      ORDER BY total_cost DESC
    `).all() as UsageRow[];

    return NextResponse.json({
      overview: {
        content_plans: contentPlansCount,
        funnels: funnelsCount,
        month_cost: monthCost,
        budget,
        top_platform: topPlatform,
      },
      chart: chartData,
      table: tableData,
      model_breakdown: modelBreakdown,
    });
  } catch (err) {
    console.error('Analytics API error:', err);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
