# Multi-Signal Scoring Tuning — Design

## Problem

Reddit memes and joke posts (especially from r/ChatGPT, r/ClaudeAI) get high upvotes/comments, which inflates their combined score. Low-quality trends appear near the top of the Trend Radar.

## Approach

Strengthen the existing AI rejection gate and adjust scoring weights. Zero extra API cost.

## Changes

### 1. Hard Rejection Gate (`lib/scoring.ts` — `toScoredTrend()`)

- If `reject === true`: cap `combined_score` at **15**, set `value_tier = 'skip'`
- If `content_value < 20` (even without explicit reject): cap `combined_score` at **20**, set `value_tier = 'skip'`
- Applied after the 6-signal calculation, as a final override

### 2. Reddit Meme-Heavy Subreddit Penalty (`lib/scoring.ts` — `toScoredTrend()`)

- Define `MEME_HEAVY_SUBREDDITS = ['ChatGPT', 'ClaudeAI']`
- If `source === 'reddit'` AND `subreddit` is in the set AND `niche_fit < 50`:
  - Apply **-15 point penalty** to `combined_score`
  - Floor at 0
- Posts with `niche_fit >= 50` are unaffected (real AI tool news passes through)

### 3. BasicScore Dampening (`lib/scoring.ts` — `calculateBasicScore()`)

Current formula: `scoreNorm * 0.4 + commentsNorm * 0.3 + freshness * 0.3`

New formula: `scoreNorm * 0.25 + commentsNorm * 0.35 + freshness * 0.40`

- Reduces raw upvote influence (was rewarding memes with high engagement)
- Increases freshness priority (better for real-time trend monitoring)

Additionally, add a source-based dampener:
- Accept optional `source` and `subreddit` params in `calculateBasicScore()`
- If Reddit + meme-heavy subreddit: multiply final score by **0.7**

## Files Modified

- `lib/scoring.ts` — all three changes
- No other files need changes (API routes already call `toScoredTrend()` and `calculateBasicScore()`)

## Not Changing

- Signal weights (30/20/15/15/10/10) — these are correct
- Sonar prompt — already strict about rejecting memes
- Velocity/freshness/cross-platform signal calculations — working as designed
- `app/api/analyze/route.ts` — no changes needed
- `app/api/trends/route.ts` — no changes needed (it already passes all data to scoring functions)
