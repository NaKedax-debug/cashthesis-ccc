import type {
  TrendItem, ScoredTrend, AIScore, ValueTier,
  SignalBreakdown, VelocityTier, EmotionalTrigger,
} from '@/types';

// ============================================
// Multi-Signal Scoring System
// combined = ai*0.30 + velocity*0.20 + comments_ratio*0.15
//          + cross_platform*0.15 + emotional*0.10 + freshness*0.10
// ============================================
const WEIGHTS = {
  ai_analysis: 0.30,
  velocity: 0.20,
  comments_ratio: 0.15,
  cross_platform: 0.15,
  emotional: 0.10,
  freshness: 0.10,
};

const MEME_HEAVY_SUBREDDITS = new Set(['ChatGPT', 'ClaudeAI']);

// --- Signal 1: AI Content Analysis (30%) ---
export function calculateAISignal(aiScore: AIScore): number {
  // Sub-weights within AI signal
  return Math.round(
    aiScore.content_value * 0.35 +
    aiScore.niche_fit * 0.25 +
    aiScore.hook_potential * 0.25 +
    aiScore.actionability * 0.15
  );
}

// --- Signal 2: Engagement Velocity (20%) ---
export interface SnapshotData {
  prev_score: number;
  prev_comments: number;
  prev_at: number; // unix seconds
  curr_score: number;
  curr_comments: number;
  curr_at: number;
}

export function calculateVelocity(snapshot?: SnapshotData): number {
  if (!snapshot) return 50; // neutral when no data
  const hoursBetween = (snapshot.curr_at - snapshot.prev_at) / 3600;
  if (hoursBetween < 0.01) return 50; // too close, neutral
  const velocity = (snapshot.curr_score - snapshot.prev_score) / hoursBetween;
  if (velocity > 200) return 100;
  if (velocity > 100) return 90;
  if (velocity > 50) return 80;
  if (velocity > 10) return 70;
  if (velocity > 0) return 50;
  if (velocity > -10) return 30;
  return 10;
}

export function getVelocityTier(velocityScore: number): VelocityTier {
  if (velocityScore >= 90) return 'explosive';
  if (velocityScore >= 70) return 'hot';
  if (velocityScore >= 50) return 'growing';
  return 'stale';
}

// --- Signal 3: Comments-to-Score Ratio (15%) ---
export function calculateCommentsRatio(comments: number, score: number): number {
  const ratio = comments / Math.max(score, 1);
  if (ratio > 0.5) return 100;
  if (ratio > 0.3) return 80;
  if (ratio > 0.1) return 60;
  if (ratio > 0) return 30;
  return 10;
}

// --- Signal 4: Cross-Platform Presence (15%) ---
export function calculateCrossPlatform(platformCount: number): number {
  if (platformCount >= 4) return 100;
  if (platformCount >= 3) return 80;
  if (platformCount >= 2) return 60;
  return 20; // single platform
}

// --- Signal 5: Emotional Trigger (10%) ---
const EMOTION_SCORES: Record<EmotionalTrigger, number> = {
  controversy: 100,
  shock: 90,
  fomo: 90,
  curiosity: 80,
  awe: 70,
  practical: 60,
  none: 20,
};

export function calculateEmotional(trigger: EmotionalTrigger): number {
  return EMOTION_SCORES[trigger] ?? 20;
}

// --- Signal 6: Freshness Decay (10%) ---
export function calculateFreshness(timestamp: number): number {
  const ageHours = (Date.now() / 1000 - timestamp) / 3600;
  if (ageHours < 1) return 100;
  if (ageHours < 3) return 90;
  if (ageHours < 6) return 80;
  if (ageHours < 12) return 60;
  if (ageHours < 24) return 40;
  if (ageHours < 168) return 20; // 7 days
  return 5;
}

// --- Combined Score ---
export function calculateMultiSignalScore(signals: SignalBreakdown): number {
  return Math.round(
    signals.ai_analysis * WEIGHTS.ai_analysis +
    signals.velocity * WEIGHTS.velocity +
    signals.comments_ratio * WEIGHTS.comments_ratio +
    signals.cross_platform * WEIGHTS.cross_platform +
    signals.emotional * WEIGHTS.emotional +
    signals.freshness * WEIGHTS.freshness
  );
}

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

export function getValueTier(score: number, reject?: boolean): ValueTier {
  if (reject) return 'skip';
  if (score >= 70) return 'high';
  if (score >= 40) return 'maybe';
  return 'skip';
}

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
