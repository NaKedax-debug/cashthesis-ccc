import { NextResponse } from 'next/server';
import { callSonar } from '@/lib/ai/perplexity';
import { getDb } from '@/lib/db';
import { calculateAISignal } from '@/lib/scoring';
import type { TrendItem, ContentFormat, EmotionalTrigger } from '@/types';

export const dynamic = 'force-dynamic';

// --- Types ---
interface SonarScoreResult {
  id: string;
  content_value: number;
  niche_fit: number;
  hook_potential: number;
  actionability: number;
  reject: boolean;
  suggested_angle: string;
  content_format: string;
  emotional_trigger: string;
}

interface CrossPlatformGroup {
  topic: string;
  platforms: string[];
  trend_ids: string[];
  cross_platform_score: number;
}

// --- Prompts ---
const ANALYSIS_PROMPT = `You are a strict content strategist for a faceless YouTube/TikTok channel in the AI + Money + Vibe Coding + Crypto niche.
Analyze each trend below. For EACH return a JSON object:
{
  "id": "trend_id",
  "content_value": 0-100,
  "niche_fit": 0-100,
  "hook_potential": 0-100,
  "actionability": 0-100,
  "reject": true/false,
  "suggested_angle": "One sentence — how WE would cover this",
  "content_format": "slideshow|screencast|ai_video|text_overlay|news_update",
  "emotional_trigger": "awe|curiosity|controversy|fomo|shock|practical|none"
}

Scoring guide:
- content_value: Is this actionable, educational, or newsworthy? Memes, jokes, art, personal stories, magic tricks = 0-15. New AI tools, tutorials, money strategies, industry news = 60-100.
- niche_fit: How relevant to AI+Money+VibeCoding+Crypto? General ChatGPT memes = 5-20. Specific AI tools/money strategies = 70-100.
- hook_potential: Can we make a strong 3-second hook? Boring/generic = 0-30. Controversial/surprising/useful = 70-100.
- actionability: Will viewer learn something or take action? Entertainment only = 0-20. Clear takeaway/tool/strategy = 70-100.
- reject: true = Skip entirely (memes, jokes, off-topic, art posts)
- emotional_trigger: What emotion does this evoke? controversy = debate/polarizing. shock = unexpected/surprising. fomo = fear of missing out/money. curiosity = makes you want to learn more. awe = impressive/wow. practical = useful/actionable. none = boring/generic.

Be VERY STRICT. Most Reddit memes and joke posts should score below 20.
A post titled "Magic." about a card trick = content_value: 5, reject: true, emotional_trigger: "none".
A post about "Netherlands cancelled 36% crypto tax" = content_value: 85, emotional_trigger: "fomo".

Return ONLY a valid JSON array, no markdown.`;

const CROSS_PLATFORM_PROMPT = `Given these trend titles from different platforms, identify topics that appear on MULTIPLE platforms (cross-platform trends). Group them by topic. Two trends are cross-platform if they discuss the SAME topic, event, tool, or news story.

For each group return:
{
  "topic": "short topic name (max 40 chars)",
  "platforms": ["reddit", "hackernews", "twitter"],
  "trend_ids": ["id1", "id2", "id3"],
  "cross_platform_score": number of unique platforms (2-6)
}

Only include groups with 2+ platforms. If no cross-platform trends found, return empty array [].
Return ONLY a valid JSON array, no markdown.`;

// --- Helpers ---
const VALID_FORMATS: ContentFormat[] = ['slideshow', 'screencast', 'ai_video', 'text_overlay', 'news_update'];
const VALID_EMOTIONS: EmotionalTrigger[] = ['awe', 'curiosity', 'controversy', 'fomo', 'shock', 'practical', 'none'];

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v || 0)));
}

function parseFormat(f: string): ContentFormat {
  const lower = (f || '').toLowerCase().trim();
  if (VALID_FORMATS.includes(lower as ContentFormat)) return lower as ContentFormat;
  return 'text_overlay';
}

function parseEmotion(e: string): EmotionalTrigger {
  const lower = (e || '').toLowerCase().trim();
  if (VALID_EMOTIONS.includes(lower as EmotionalTrigger)) return lower as EmotionalTrigger;
  return 'none';
}

// --- Main Handler ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trends, detectCrossPlatform } = body as {
      trends: TrendItem[];
      detectCrossPlatform?: boolean;
    };

    if (!trends || trends.length === 0) {
      return NextResponse.json({ error: 'No trends provided' }, { status: 400 });
    }

    // === STEP 1: AI Content Analysis (batches of 25) ===
    const batch = trends.slice(0, 25);

    const trendSummary = batch
      .map((t) => {
        const sub = t.subreddit ? ` (r/${t.subreddit})` : '';
        return `- id: "${t.id}" | [${t.source}${sub}] "${t.title}" (upvotes: ${t.score}, comments: ${t.comments})`;
      })
      .join('\n');

    const fullPrompt = `${ANALYSIS_PROMPT}\n\nTrending topics to analyze:\n${trendSummary}`;

    const result = await callSonar(fullPrompt, {
      endpoint: 'analyze-trends',
    });

    let scores: SonarScoreResult[];
    try {
      const cleaned = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      scores = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI scores:', result.text.slice(0, 300));
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 500 });
    }

    if (!Array.isArray(scores)) {
      return NextResponse.json({ error: 'AI returned non-array' }, { status: 500 });
    }

    // === STEP 2: Cross-Platform Detection (optional, only on full analyze) ===
    let crossPlatformGroups: CrossPlatformGroup[] = [];
    if (detectCrossPlatform && trends.length > 10) {
      try {
        const cpSummary = trends
          .map((t) => `- id: "${t.id}" [${t.source}] "${t.title}"`)
          .join('\n');

        const cpResult = await callSonar(
          `${CROSS_PLATFORM_PROMPT}\n\nTrends:\n${cpSummary}`,
          { endpoint: 'cross-platform-detect' }
        );

        const cpCleaned = cpResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cpCleaned);
        if (Array.isArray(parsed)) {
          crossPlatformGroups = parsed.filter(
            (g: CrossPlatformGroup) => g.trend_ids && g.trend_ids.length > 0 && g.cross_platform_score >= 2
          );
        }
      } catch (err) {
        console.error('Cross-platform detection failed:', err);
        // Non-fatal — continue without cross-platform data
      }
    }

    // Build cross-platform lookup: trend_id → { topic, platforms, score }
    const cpMap = new Map<string, { topic: string; platforms: string[]; score: number }>();
    for (const group of crossPlatformGroups) {
      for (const tid of group.trend_ids) {
        cpMap.set(tid, {
          topic: group.topic,
          platforms: group.platforms,
          score: group.cross_platform_score,
        });
      }
    }

    // === STEP 3: Save to DB ===
    const db = getDb();
    const scoreById = new Map<string, SonarScoreResult>();
    scores.forEach((s) => { if (s.id) scoreById.set(s.id, s); });

    const stmt = db.prepare(`
      INSERT INTO trend_scores (
        trend_id, content_value, niche_fit, hook_potential, actionability,
        combined_score, reject, suggested_angle, content_format,
        emotional_trigger, cross_platform_score, cross_platform_topic, cross_platform_sources,
        scored_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const legacyStmt = db.prepare(`
      INSERT OR REPLACE INTO ai_scores (
        trend_id, virality, niche_fit, content_potential, content_value,
        suggested_format, hook_idea, suggested_angle, reject, scored_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const results: Array<{ id: string; combined_score: number; reject: boolean }> = [];

    const saveScores = db.transaction(() => {
      for (let i = 0; i < batch.length; i++) {
        const s = scoreById.get(batch[i].id) ?? scores[i];
        if (!s) continue;

        // Polymarket bonus
        const polyBonus = batch[i].source === 'polymarket' ? 10 : 0;
        const cv = clamp(s.content_value + polyBonus);
        const nf = clamp(s.niche_fit);
        const hp = clamp(s.hook_potential);
        const ac = clamp(s.actionability);
        const reject = !!s.reject;
        const angle = s.suggested_angle || '';
        const format = parseFormat(s.content_format);
        const emotion = parseEmotion(s.emotional_trigger);

        // Cross-platform info
        const cp = cpMap.get(batch[i].id);
        const cpScore = cp ? Math.min(cp.score, 6) : 1;
        const cpTopic = cp?.topic || null;
        const cpSources = cp?.platforms ? JSON.stringify(cp.platforms) : null;

        // AI sub-score for combined calculation
        const aiSignal = calculateAISignal({
          content_value: cv, niche_fit: nf, hook_potential: hp,
          actionability: ac, reject, suggested_angle: angle,
          content_format: format, emotional_trigger: emotion,
        });

        // Delete previous scores for this trend
        db.prepare('DELETE FROM trend_scores WHERE trend_id = ?').run(batch[i].id);

        stmt.run(
          batch[i].id,
          cv, nf, hp, ac,
          aiSignal, // store AI signal as combined_score in DB (final combined computed in trends route)
          reject ? 1 : 0,
          angle, format, emotion,
          cpScore, cpTopic, cpSources
        );

        // Legacy table
        legacyStmt.run(batch[i].id, hp, nf, ac, cv, format, angle, angle, reject ? 1 : 0);

        results.push({ id: batch[i].id, combined_score: aiSignal, reject });
      }
    });

    saveScores();

    return NextResponse.json({
      scores: results,
      cross_platform: crossPlatformGroups,
      usage: result.usage,
      analyzed: results.length,
    });
  } catch (err) {
    console.error('Analyze API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
