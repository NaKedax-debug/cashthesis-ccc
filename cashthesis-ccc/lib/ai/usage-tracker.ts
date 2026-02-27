import type { APIUsageRecord, CostSummary } from '@/types';
import { getDb } from '@/lib/db';

export async function trackUsage(record: Omit<APIUsageRecord, 'id' | 'timestamp'>): Promise<void> {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO api_usage (provider, model, input_tokens, output_tokens, cost_usd, endpoint, trend_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.provider,
      record.model,
      record.input_tokens,
      record.output_tokens,
      record.cost_usd,
      record.endpoint,
      record.trend_id ?? null
    );
  } catch (err) {
    console.error('Failed to track usage:', err);
  }
}

export function getCostSummary(): CostSummary {
  const db = getDb();
  const budget = parseFloat(process.env.NEXT_PUBLIC_MONTHLY_BUDGET ?? '30');

  const todayRow = db.prepare(`
    SELECT COALESCE(SUM(cost_usd), 0) as total
    FROM api_usage
    WHERE date(timestamp) = date('now')
  `).get() as { total: number };

  const weekRow = db.prepare(`
    SELECT COALESCE(SUM(cost_usd), 0) as total
    FROM api_usage
    WHERE timestamp >= datetime('now', '-7 days')
  `).get() as { total: number };

  const monthRow = db.prepare(`
    SELECT COALESCE(SUM(cost_usd), 0) as total
    FROM api_usage
    WHERE timestamp >= datetime('now', 'start of month')
  `).get() as { total: number };

  const modelRows = db.prepare(`
    SELECT model, COALESCE(SUM(cost_usd), 0) as total
    FROM api_usage
    WHERE timestamp >= datetime('now', 'start of month')
    GROUP BY model
  `).all() as Array<{ model: string; total: number }>;

  const by_model: Record<string, number> = {};
  for (const row of modelRows) {
    by_model[row.model] = row.total;
  }

  return {
    today: todayRow.total,
    week: weekRow.total,
    month: monthRow.total,
    by_model,
    budget,
  };
}
