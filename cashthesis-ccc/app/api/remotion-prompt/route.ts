import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateRemotionPrompt } from '@/lib/remotion-prompt-generator';

export async function POST(request: Request) {
  try {
    const { trendId, planId } = (await request.json()) as {
      trendId?: string;
      planId?: string;
    };

    let resolvedTrendId = trendId;

    // If planId provided, look up the trend_id from content_plans
    if (!resolvedTrendId && planId) {
      const db = getDb();
      const plan = db.prepare('SELECT trend_id FROM content_plans WHERE id = ?').get(planId) as
        | { trend_id: string }
        | undefined;
      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      resolvedTrendId = plan.trend_id;
    }

    if (!resolvedTrendId) {
      return NextResponse.json({ error: 'trendId or planId required' }, { status: 400 });
    }

    // Fetch trend data with AI scores
    const db = getDb();
    const trend = db.prepare(`
      SELECT t.*, ts.suggested_angle, ts.content_format, ts.emotional_trigger,
             ts.content_value, ts.niche_fit, ts.hook_potential, ts.combined_score
      FROM trends_cache t
      LEFT JOIN trend_scores ts ON ts.trend_id = t.id
      WHERE t.id = ?
    `).get(resolvedTrendId) as {
      id: string;
      source: string;
      title: string;
      url: string;
      score: number;
      suggested_angle?: string;
      content_format?: string;
      emotional_trigger?: string;
      combined_score?: number;
      content_value?: number;
      niche_fit?: number;
      hook_potential?: number;
    } | undefined;

    if (!trend) {
      return NextResponse.json({ error: 'Trend not found' }, { status: 404 });
    }

    const result = await generateRemotionPrompt({
      title: trend.title,
      source: trend.source,
      url: trend.url,
      score: trend.score,
      suggested_angle: trend.suggested_angle,
      emotional_trigger: trend.emotional_trigger,
      content_format: trend.content_format,
      combined_score: trend.combined_score,
      content_value: trend.content_value,
      niche_fit: trend.niche_fit,
      hook_potential: trend.hook_potential,
    });

    return NextResponse.json({
      prompt: result.prompt,
      detectedFormat: result.detectedFormat,
      estimatedDuration: result.estimatedDuration,
      usage: result.usage,
    });
  } catch (err) {
    console.error('Remotion prompt generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
