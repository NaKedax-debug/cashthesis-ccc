// ============================================
// CashThesis CCC — Core Types
// ============================================

export type TrendSource = 'reddit' | 'hackernews' | 'youtube' | 'producthunt' | 'twitter' | 'polymarket';
export type Niche = 'ai' | 'money' | 'crypto' | 'vibecoding';
export type TimeFilter = '1h' | '6h' | '24h' | '7d';
export type ContentFormat = 'slideshow' | 'screencast' | 'ai_video' | 'text_overlay' | 'news_update';
// Keep legacy alias for backward compat
export type SuggestedFormat = ContentFormat;

export type EmotionalTrigger = 'awe' | 'curiosity' | 'controversy' | 'fomo' | 'shock' | 'practical' | 'none';
export type SortBy = 'combined' | 'velocity' | 'cross_platform' | 'freshness';

export interface TrendItem {
  id: string;
  source: TrendSource;
  title: string;
  url: string;
  score: number;
  comments: number;
  timestamp: number;
  author: string;
  subreddit?: string;
  extra?: Record<string, unknown>;
}

export interface AIScore {
  content_value: number;
  niche_fit: number;
  hook_potential: number;
  actionability: number;
  reject: boolean;
  suggested_angle: string;
  content_format: ContentFormat;
  emotional_trigger: EmotionalTrigger;
}

export interface SignalBreakdown {
  ai_analysis: number;       // Signal 1 (30%)
  velocity: number;          // Signal 2 (20%)
  comments_ratio: number;    // Signal 3 (15%)
  cross_platform: number;    // Signal 4 (15%)
  emotional: number;         // Signal 5 (10%)
  freshness: number;         // Signal 6 (10%)
}

export type VelocityTier = 'explosive' | 'hot' | 'growing' | 'stale';

export interface CrossPlatformInfo {
  topic: string;
  platforms: TrendSource[];
  score: number; // 20-100
}

export type ValueTier = 'high' | 'maybe' | 'skip';

export interface ScoredTrend extends TrendItem {
  ai_score?: AIScore;
  combined_score: number;
  value_tier?: ValueTier;
  saved?: boolean;
  signals?: SignalBreakdown;
  velocity_tier?: VelocityTier;
  cross_platform?: CrossPlatformInfo;
}

export interface APIUsageRecord {
  id?: number;
  timestamp?: string;
  provider: 'anthropic' | 'perplexity' | 'elevenlabs';
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  endpoint: string;
  trend_id?: number;
}

export interface CostSummary {
  today: number;
  week: number;
  month: number;
  by_model: Record<string, number>;
  budget: number;
}

export interface FilterState {
  niches: Niche[];
  sources: TrendSource[];
  time: TimeFilter;
  limit: number;
  hideRejected: boolean;
  sortBy: SortBy;
}

// ============================================
// Phase 2 — Content Factory
// ============================================

export type Platform = 'tiktok' | 'youtube_shorts' | 'instagram_reels' | 'threads' | 'twitter';

export interface PlatformContent {
  platform: Platform;
  title: string;
  hook: string;
  script: string;
  hashtags: string[];
  cta: string;
  format: ContentFormat;
  estimated_duration: string;
}

export interface ContentPlan {
  id: string;
  trend_id: string;
  trend_title: string;
  trend_source: TrendSource;
  platforms: PlatformContent[];
  seo_keywords: string[];
  hook_variants: string[];
  created_at: string;
  status: 'draft' | 'in_production' | 'published';
}

export interface ContentPlanSummary {
  id: string;
  trend_title: string;
  trend_source: TrendSource;
  platform_count: number;
  status: ContentPlan['status'];
  created_at: string;
}

// ============================================
// Phase 3 — Funnel Builder
// ============================================

export type AffiliateNiche = 'crypto' | 'hosting' | 'vpn' | 'education' | 'products' | 'ai_tools' | 'aggregator';

export interface AffiliateLink {
  id: string;
  name: string;
  niche: AffiliateNiche;
  commission: string;
  signup_url: string;
  tracking_url: string;
  notes?: string;
}

export type FunnelStepType = 'content' | 'cta' | 'landing' | 'affiliate' | 'lead_magnet' | 'email_list' | 'upsell';

export interface FunnelStep {
  id: string;
  type: FunnelStepType;
  label: string;
  url?: string;
  affiliate_id?: string;
  children: FunnelStep[];
}

export interface Funnel {
  id: string;
  name: string;
  content_plan_id?: string;
  steps: FunnelStep[];
  created_at: string;
  updated_at: string;
}
