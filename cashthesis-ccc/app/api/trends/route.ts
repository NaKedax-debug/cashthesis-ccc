import { NextResponse } from 'next/server';
import { fetchRedditTrends } from '@/lib/sources/reddit';
import { fetchHackerNewsTrends } from '@/lib/sources/hackernews';
import { fetchYouTubeTrends } from '@/lib/sources/youtube';
import { fetchProductHuntTrends } from '@/lib/sources/producthunt';
import { fetchTwitterTrends } from '@/lib/sources/twitter';
import { fetchPolymarketTrends } from '@/lib/sources/polymarket';
import {
  toScoredTrend, calculateBasicScore,
  type SnapshotData,
} from '@/lib/scoring';
import { getDb } from '@/lib/db';
import type { TrendItem, ScoredTrend, TrendSource, ContentFormat, EmotionalTrigger } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sources = (searchParams.get('sources') || 'reddit,hackernews,youtube,producthunt,twitter,polymarket').split(',') as TrendSource[];
  const useCache = searchParams.get('cache') === 'true';

  try {
    let trends: TrendItem[] = [];

    if (useCache) {
      trends = getCachedTrends(sources);
    }

    if (trends.length === 0) {
      const fetchers: Promise<TrendItem[]>[] = [];
      if (sources.includes('reddit')) fetchers.push(fetchRedditTrends());
      if (sources.includes('hackernews')) fetchers.push(fetchHackerNewsTrends());
      if (sources.includes('youtube')) fetchers.push(fetchYouTubeTrends());
      if (sources.includes('producthunt')) fetchers.push(fetchProductHuntTrends());
      if (sources.includes('twitter')) fetchers.push(fetchTwitterTrends());
      if (sources.includes('polymarket')) fetchers.push(fetchPolymarketTrends());

      const results = await Promise.allSettled(fetchers);
      trends = results
        .filter((r): r is PromiseFulfilledResult<TrendItem[]> => r.status === 'fulfilled')
        .flatMap((r) => r.value);

      cacheTrends(trends);
    }

    // Save snapshots for velocity tracking
    saveSnapshots(trends);

    const db = getDb();

    // Load AI scores from trend_scores (latest per trend_id)
    const savedScores = db.prepare(`
      SELECT ts.* FROM trend_scores ts
      INNER JOIN (
        SELECT trend_id, MAX(id) as max_id FROM trend_scores GROUP BY trend_id
      ) latest ON ts.id = latest.max_id
    `).all() as Array<{
      trend_id: string;
      content_value: number;
      niche_fit: number;
      hook_potential: number;
      actionability: number;
      combined_score: number;
      reject: number;
      suggested_angle: string;
      content_format: string;
      emotional_trigger: string;
      cross_platform_score: number;
      cross_platform_topic: string | null;
      cross_platform_sources: string | null;
    }>;
    const scoreMap = new Map(savedScores.map((s) => [s.trend_id, s]));

    // Load velocity snapshots (prev and current per trend)
    const snapshotMap = loadSnapshots(db, trends);

    // Load saved trends
    const savedTrends = db.prepare('SELECT trend_id FROM saved_trends').all() as Array<{ trend_id: string }>;
    const savedSet = new Set(savedTrends.map((s) => s.trend_id));

    // Build scored trends with all 6 signals
    const scored: ScoredTrend[] = trends.map((t) => {
      const dbScore = scoreMap.get(t.id);
      const snapshot = snapshotMap.get(t.id);

      let cpSources: string[] | undefined;
      if (dbScore?.cross_platform_sources) {
        try { cpSources = JSON.parse(dbScore.cross_platform_sources); } catch { /* */ }
      }

      const st = toScoredTrend(
        t,
        dbScore ? {
          content_value: dbScore.content_value,
          niche_fit: dbScore.niche_fit,
          hook_potential: dbScore.hook_potential,
          actionability: dbScore.actionability,
          reject: !!dbScore.reject,
          suggested_angle: dbScore.suggested_angle ?? '',
          content_format: (dbScore.content_format || 'text_overlay') as ContentFormat,
          emotional_trigger: (dbScore.emotional_trigger || 'none') as EmotionalTrigger,
        } : undefined,
        snapshot,
        dbScore?.cross_platform_score ?? 1,
        dbScore?.cross_platform_topic ?? undefined,
        cpSources,
      );
      st.saved = savedSet.has(t.id);
      return st;
    });

    // Sort: high-value first, rejected last
    scored.sort((a, b) => {
      const aReject = a.ai_score?.reject ? 1 : 0;
      const bReject = b.ai_score?.reject ? 1 : 0;
      if (aReject !== bReject) return aReject - bReject;

      const tierOrder = { high: 0, maybe: 1, skip: 2 };
      const aTier = a.value_tier ? tierOrder[a.value_tier] : 1;
      const bTier = b.value_tier ? tierOrder[b.value_tier] : 1;
      if (aTier !== bTier) return aTier - bTier;

      return b.combined_score - a.combined_score;
    });

    // Count cross-platform trends
    const crossPlatformCount = scored.filter((t) => t.cross_platform && t.cross_platform.platforms.length >= 2).length;

    return NextResponse.json({
      trends: scored,
      total: scored.length,
      cross_platform_count: crossPlatformCount,
    });
  } catch (err) {
    console.error('Trends API error:', err);
    const cached = getCachedTrends(sources);
    const scored = cached.map((t) => ({
      ...t,
      combined_score: calculateBasicScore(t),
    }));
    return NextResponse.json({ trends: scored, total: scored.length, cached: true });
  }
}

// --- Snapshot Management ---
function saveSnapshots(trends: TrendItem[]) {
  try {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO trend_snapshots (trend_id, source, score, comments, snapshot_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    const insert = db.transaction((items: TrendItem[]) => {
      for (const t of items) {
        stmt.run(t.id, t.source, t.score, t.comments);
      }
    });
    insert(trends);
  } catch (err) {
    console.error('Snapshot save error:', err);
  }
}

function loadSnapshots(db: ReturnType<typeof getDb>, trends: TrendItem[]): Map<string, SnapshotData> {
  const map = new Map<string, SnapshotData>();
  try {
    // Get the two most recent snapshots per trend
    const ids = trends.map((t) => t.id);
    if (ids.length === 0) return map;

    // Get previous snapshots (not the current one we just inserted)
    const rows = db.prepare(`
      SELECT trend_id, score, comments,
        CAST(strftime('%s', snapshot_at) AS INTEGER) as snapshot_ts
      FROM trend_snapshots
      WHERE trend_id IN (${ids.map(() => '?').join(',')})
      ORDER BY snapshot_at DESC
    `).all(...ids) as Array<{
      trend_id: string;
      score: number;
      comments: number;
      snapshot_ts: number;
    }>;

    // Group by trend_id, take latest two
    const grouped = new Map<string, typeof rows>();
    for (const row of rows) {
      const arr = grouped.get(row.trend_id) || [];
      if (arr.length < 2) arr.push(row);
      grouped.set(row.trend_id, arr);
    }

    for (const [tid, snapshots] of Array.from(grouped.entries())) {
      if (snapshots.length >= 2) {
        map.set(tid, {
          curr_score: snapshots[0].score,
          curr_comments: snapshots[0].comments,
          curr_at: snapshots[0].snapshot_ts,
          prev_score: snapshots[1].score,
          prev_comments: snapshots[1].comments,
          prev_at: snapshots[1].snapshot_ts,
        });
      }
    }
  } catch (err) {
    console.error('Snapshot load error:', err);
  }
  return map;
}

// --- Cache ---
function cacheTrends(trends: TrendItem[]) {
  try {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO trends_cache (id, source, title, url, score, comments, timestamp, author, subreddit, extra, fetched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const insert = db.transaction((items: TrendItem[]) => {
      for (const t of items) {
        stmt.run(t.id, t.source, t.title, t.url, t.score, t.comments, t.timestamp, t.author, t.subreddit ?? null, JSON.stringify(t.extra ?? null));
      }
    });
    insert(trends);
  } catch (err) {
    console.error('Cache write error:', err);
  }
}

function getCachedTrends(sources: TrendSource[]): TrendItem[] {
  try {
    const db = getDb();
    const placeholders = sources.map(() => '?').join(',');
    const rows = db.prepare(`
      SELECT * FROM trends_cache
      WHERE source IN (${placeholders})
      AND fetched_at >= datetime('now', '-1 hour')
      ORDER BY score DESC
    `).all(...sources) as Array<{
      id: string; source: string; title: string; url: string;
      score: number; comments: number; timestamp: number;
      author: string; subreddit: string | null; extra: string | null;
    }>;

    return rows.map((r) => ({
      id: r.id,
      source: r.source as TrendSource,
      title: r.title,
      url: r.url,
      score: r.score,
      comments: r.comments,
      timestamp: r.timestamp,
      author: r.author,
      subreddit: r.subreddit ?? undefined,
      extra: r.extra ? JSON.parse(r.extra) : undefined,
    }));
  } catch {
    return [];
  }
}
