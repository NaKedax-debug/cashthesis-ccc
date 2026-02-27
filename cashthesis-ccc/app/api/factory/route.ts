import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { callClaude } from '@/lib/ai/anthropic';
import type { ContentPlan, ContentPlanSummary, PlatformContent, Platform } from '@/types';

const PLATFORMS: Platform[] = ['tiktok', 'youtube_shorts', 'instagram_reels', 'threads', 'twitter'];

const SYSTEM_PROMPT = `You are a content strategist for a faceless YouTube/TikTok channel in the AI + Money + Vibe Coding niche. You create viral short-form content plans.

Always respond with ONLY valid JSON — no markdown fences, no explanation.`;

function buildGeneratePrompt(trendTitle: string, trendSource: string, context: string): string {
  return `Based on this trending topic, create a full content plan for a faceless channel in the AI+Money niche.

TREND: "${trendTitle}"
SOURCE: ${trendSource}
${context ? `CONTEXT: ${context}` : ''}

For EACH platform (TikTok, YouTube Shorts, Instagram Reels, Threads, Twitter/X), provide:
- title: catchy title for the platform
- hook: first 3 seconds / first line that grabs attention
- script: full script (60-90 seconds for video, 280 chars for Twitter, 500 chars for Threads)
- hashtags: array of 5-8 relevant hashtags
- cta: call to action
- format: one of "slideshow", "screencast", "ai_video", "text_overlay", "timelapse"
- estimated_duration: production time estimate

Also provide:
- seo_keywords: array of 8-12 SEO keywords
- hook_variants: array of 3 alternative hooks for A/B testing

Return JSON:
{
  "platforms": [
    { "platform": "tiktok", "title": "...", "hook": "...", "script": "...", "hashtags": [...], "cta": "...", "format": "...", "estimated_duration": "..." },
    { "platform": "youtube_shorts", ... },
    { "platform": "instagram_reels", ... },
    { "platform": "threads", ... },
    { "platform": "twitter", ... }
  ],
  "seo_keywords": [...],
  "hook_variants": [...]
}`;
}

// POST — generate a new content plan
export async function POST(request: Request) {
  try {
    const { trend_id, trend_title, trend_source, context } = (await request.json()) as {
      trend_id: string;
      trend_title: string;
      trend_source: string;
      context?: string;
    };

    if (!trend_id || !trend_title) {
      return NextResponse.json({ error: 'trend_id and trend_title required' }, { status: 400 });
    }

    const prompt = buildGeneratePrompt(trend_title, trend_source, context ?? '');

    const result = await callClaude(prompt, {
      model: 'claude-3-haiku-20240307',
      maxTokens: 4096,
      system: SYSTEM_PROMPT,
      endpoint: 'factory-generate',
    });

    // Parse response
    let parsed: { platforms: PlatformContent[]; seo_keywords: string[]; hook_variants: string[] };
    try {
      const cleaned = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse factory response:', result.text);
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 500 });
    }

    // Validate platforms
    const validPlatforms = parsed.platforms.filter(
      (p) => PLATFORMS.includes(p.platform) && p.title && p.script
    );

    // Save to DB
    const planId = `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const db = getDb();

    db.prepare(`
      INSERT INTO content_plans (id, trend_id, trend_title, trend_source, platforms, seo_keywords, hook_variants, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
    `).run(
      planId,
      trend_id,
      trend_title,
      trend_source,
      JSON.stringify(validPlatforms),
      JSON.stringify(parsed.seo_keywords ?? []),
      JSON.stringify(parsed.hook_variants ?? [])
    );

    const plan: ContentPlan = {
      id: planId,
      trend_id,
      trend_title,
      trend_source: trend_source as ContentPlan['trend_source'],
      platforms: validPlatforms,
      seo_keywords: parsed.seo_keywords ?? [],
      hook_variants: parsed.hook_variants ?? [],
      created_at: new Date().toISOString(),
      status: 'draft',
    };

    return NextResponse.json({ plan, usage: result.usage });
  } catch (err) {
    console.error('Factory generate error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}

// GET — list all content plans or get a specific one
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('id');
    const db = getDb();

    if (planId) {
      const row = db.prepare('SELECT * FROM content_plans WHERE id = ?').get(planId) as {
        id: string;
        trend_id: string;
        trend_title: string;
        trend_source: string;
        platforms: string;
        seo_keywords: string;
        hook_variants: string;
        status: string;
        created_at: string;
      } | undefined;

      if (!row) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      const plan: ContentPlan = {
        id: row.id,
        trend_id: row.trend_id,
        trend_title: row.trend_title,
        trend_source: row.trend_source as ContentPlan['trend_source'],
        platforms: JSON.parse(row.platforms),
        seo_keywords: JSON.parse(row.seo_keywords),
        hook_variants: JSON.parse(row.hook_variants),
        created_at: row.created_at,
        status: row.status as ContentPlan['status'],
      };

      return NextResponse.json({ plan });
    }

    // List all plans
    const rows = db.prepare(`
      SELECT id, trend_title, trend_source, platforms, status, created_at
      FROM content_plans
      ORDER BY created_at DESC
    `).all() as Array<{
      id: string;
      trend_title: string;
      trend_source: string;
      platforms: string;
      status: string;
      created_at: string;
    }>;

    const plans: ContentPlanSummary[] = rows.map((r) => ({
      id: r.id,
      trend_title: r.trend_title,
      trend_source: r.trend_source as ContentPlanSummary['trend_source'],
      platform_count: JSON.parse(r.platforms).length,
      status: r.status as ContentPlanSummary['status'],
      created_at: r.created_at,
    }));

    return NextResponse.json({ plans });
  } catch (err) {
    console.error('Factory list error:', err);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

// PATCH — update plan status
export async function PATCH(request: Request) {
  try {
    const { id, status } = (await request.json()) as { id: string; status: string };

    if (!id || !['draft', 'in_production', 'published'].includes(status)) {
      return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('UPDATE content_plans SET status = ? WHERE id = ?').run(status, id);

    return NextResponse.json({ ok: true, id, status });
  } catch (err) {
    console.error('Factory update error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
