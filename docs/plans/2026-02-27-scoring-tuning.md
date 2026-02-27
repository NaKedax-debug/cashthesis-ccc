# Scoring Tuning Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Suppress Reddit meme noise in Trend Radar by strengthening the AI rejection gate, adding a subreddit penalty, and reweighting the fallback score formula.

**Architecture:** All changes are in `lib/scoring.ts`. The scoring module is a pure-function library — no DB calls, no side effects. The API routes (`app/api/trends/route.ts`) call these functions and need no changes. There is no test framework configured, so we verify via `npm run build` (TypeScript type-checking) and manual inspection.

**Tech Stack:** TypeScript, Next.js 14

**Design doc:** `docs/plans/2026-02-27-scoring-tuning-design.md`

---

### Task 1: Add MEME_HEAVY_SUBREDDITS constant

**Files:**
- Modify: `cashthesis-ccc/lib/scoring.ts:11-18` (after WEIGHTS constant)

**Step 1: Add the constant**

After the `WEIGHTS` object (line 18), add:

```typescript
const MEME_HEAVY_SUBREDDITS = new Set(['ChatGPT', 'ClaudeAI']);
```

**Step 2: Verify build**

Run: `cd cashthesis-ccc && npm run build`
Expected: Build succeeds, no type errors

**Step 3: Commit**

```bash
git add lib/scoring.ts
git commit -m "feat(scoring): add MEME_HEAVY_SUBREDDITS constant"
```

---

### Task 2: Reweight calculateBasicScore with meme dampening

**Files:**
- Modify: `cashthesis-ccc/lib/scoring.ts` — `calculateBasicScore()` function (lines 120-125)

**Step 1: Update the function**

Replace the current `calculateBasicScore` function:

```typescript
/** Fallback scoring without AI — based on engagement metrics only */
export function calculateBasicScore(trend: TrendItem): number {
  const scoreNorm = Math.min(trend.score / 1000, 1) * 100;
  const commentsNorm = Math.min(trend.comments / 200, 1) * 100;
  const freshness = calculateFreshness(trend.timestamp);
  let basic = Math.round(scoreNorm * 0.25 + commentsNorm * 0.35 + freshness * 0.40);

  // Dampen meme-heavy subreddits that haven't been AI-scored yet
  if (trend.source === 'reddit' && trend.subreddit && MEME_HEAVY_SUBREDDITS.has(trend.subreddit)) {
    basic = Math.round(basic * 0.7);
  }

  return basic;
}
```

Key changes from current code:
- Weights: `0.4/0.3/0.3` → `0.25/0.35/0.40` (less upvote influence, more freshness)
- New: 0.7x multiplier for Reddit meme-heavy subreddits
- Signature unchanged — `TrendItem` already has `source` and `subreddit` fields

**Step 2: Verify build**

Run: `cd cashthesis-ccc && npm run build`
Expected: Build succeeds. No call-site changes needed — both callers (`scoring.ts:145` and `route.ts:139`) pass `TrendItem` which has all required fields.

**Step 3: Commit**

```bash
git add lib/scoring.ts
git commit -m "feat(scoring): reweight basicScore — less upvote bias, meme subreddit dampener"
```

---

### Task 3: Add hard rejection gate and subreddit penalty to toScoredTrend

**Files:**
- Modify: `cashthesis-ccc/lib/scoring.ts` — `toScoredTrend()` function (lines 134-177)

**Step 1: Update the function**

Replace the current `toScoredTrend` function:

```typescript
export function toScoredTrend(
  trend: TrendItem,
  aiScore?: AIScore,
  snapshot?: SnapshotData,
  crossPlatformCount?: number,
  crossPlatformTopic?: string,
  crossPlatformSources?: string[],
): ScoredTrend {
  if (!aiScore) {
    return {
      ...trend,
      combined_score: calculateBasicScore(trend),
    };
  }

  const velocityScore = calculateVelocity(snapshot);

  const signals: SignalBreakdown = {
    ai_analysis: calculateAISignal(aiScore),
    velocity: velocityScore,
    comments_ratio: calculateCommentsRatio(trend.comments, trend.score),
    cross_platform: calculateCrossPlatform(crossPlatformCount ?? 1),
    emotional: calculateEmotional(aiScore.emotional_trigger),
    freshness: calculateFreshness(trend.timestamp),
  };

  let combined_score = calculateMultiSignalScore(signals);

  // --- Hard Rejection Gate ---
  // Explicit reject: cap at 15
  if (aiScore.reject) {
    combined_score = Math.min(combined_score, 15);
  }
  // Low content_value auto-skip: cap at 20
  if (aiScore.content_value < 20) {
    combined_score = Math.min(combined_score, 20);
  }

  // --- Reddit Meme-Heavy Subreddit Penalty ---
  if (
    trend.source === 'reddit' &&
    trend.subreddit &&
    MEME_HEAVY_SUBREDDITS.has(trend.subreddit) &&
    aiScore.niche_fit < 50
  ) {
    combined_score = Math.max(0, combined_score - 15);
  }

  const value_tier = getValueTier(combined_score, aiScore.reject || aiScore.content_value < 20);
  const velocity_tier = getVelocityTier(velocityScore);

  return {
    ...trend,
    ai_score: aiScore,
    combined_score,
    value_tier,
    signals,
    velocity_tier,
    cross_platform: crossPlatformCount && crossPlatformCount > 1 ? {
      topic: crossPlatformTopic || '',
      platforms: (crossPlatformSources || [trend.source]) as TrendItem['source'][],
      score: signals.cross_platform,
    } : undefined,
  };
}
```

Key changes from current code:
- `combined_score` is now `let` (was `const`) so we can apply caps/penalties
- Added hard rejection gate: `reject=true` → cap at 15; `content_value<20` → cap at 20
- Added subreddit penalty: -15 for meme-heavy subs with low niche_fit
- `getValueTier` now also receives `content_value < 20` as a reject trigger

**Step 2: Verify build**

Run: `cd cashthesis-ccc && npm run build`
Expected: Build succeeds. No type errors, no call-site changes needed.

**Step 3: Commit**

```bash
git add lib/scoring.ts
git commit -m "feat(scoring): hard rejection gate + Reddit meme subreddit penalty"
```

---

### Task 4: Manual verification

**Step 1: Start dev server**

Run: `cd cashthesis-ccc && npm run dev`

**Step 2: Verify scoring behavior**

Open `http://localhost:3000` in browser. Check:
1. Click "AI Score All" to run the analyze pipeline
2. After scoring, rejected trends (memes) should show scores <= 15
3. Trends with low `content_value` should show scores <= 20
4. Reddit posts from r/ChatGPT and r/ClaudeAI with low niche_fit should appear near the bottom
5. Legitimate high-quality trends should still score 60+ and appear at the top

**Step 3: Final commit if any adjustments needed**

```bash
git add -A
git commit -m "fix(scoring): adjustments from manual testing"
```
