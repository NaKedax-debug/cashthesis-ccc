'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink, Target, Star, MessageCircle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ScoredTrend, ValueTier, ContentFormat, EmotionalTrigger, VelocityTier } from '@/types';

const SOURCE_CONFIG: Record<string, { color: string; label: string }> = {
  reddit: { color: '#ff4500', label: 'Reddit' },
  hackernews: { color: '#ff6600', label: 'HN' },
  youtube: { color: '#ff0000', label: 'YouTube' },
  producthunt: { color: '#da552f', label: 'PH' },
  twitter: { color: '#1d9bf0', label: 'X' },
  polymarket: { color: '#a855f7', label: 'Polymarket' },
};

const VALUE_TIER_CONFIG: Record<ValueTier, { label: string; emoji: string; className: string }> = {
  high: { label: 'High Value', emoji: '\u{1F7E2}', className: 'bg-[#00e68a]/20 text-[#00e68a] border-[#00e68a]/30' },
  maybe: { label: 'Maybe', emoji: '\u{1F7E1}', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  skip: { label: 'Skip', emoji: '\u{1F534}', className: 'bg-[#ff4d6a]/15 text-[#ff4d6a] border-[#ff4d6a]/30' },
};

const FORMAT_LABELS: Record<ContentFormat, string> = {
  slideshow: 'Slideshow',
  screencast: 'Screencast',
  ai_video: 'AI Video',
  text_overlay: 'Text',
  news_update: 'News',
};

const VELOCITY_CONFIG: Record<VelocityTier, { emoji: string; label: string; color: string }> = {
  explosive: { emoji: '\u{1F680}', label: 'Explosive', color: '#ff4d6a' },
  hot: { emoji: '\u{1F525}', label: 'Hot', color: '#ff8c00' },
  growing: { emoji: '\u{1F4C8}', label: 'Growing', color: '#00e68a' },
  stale: { emoji: '\u{1F634}', label: 'Stale', color: '#555' },
};

const EMOTION_CONFIG: Record<EmotionalTrigger, { emoji: string; label: string }> = {
  shock: { emoji: '\u{1F92F}', label: 'shock' },
  controversy: { emoji: '\u{1F525}', label: 'controversy' },
  curiosity: { emoji: '\u{1F914}', label: 'curiosity' },
  awe: { emoji: '\u{1F632}', label: 'awe' },
  fomo: { emoji: '\u{1F4B0}', label: 'fomo' },
  practical: { emoji: '\u{1F6E0}', label: 'practical' },
  none: { emoji: '', label: '' },
};

interface TrendCardProps {
  trend: ScoredTrend;
  onSave?: (id: string) => void;
}

export function TrendCard({ trend, onSave }: TrendCardProps) {
  const router = useRouter();
  const source = SOURCE_CONFIG[trend.source] ?? { color: '#888', label: trend.source };
  const timeAgo = getTimeAgo(trend.timestamp);

  const isRejected = trend.ai_score?.reject;
  const isLowValue = trend.value_tier === 'skip' || isRejected;
  const tierConfig = trend.value_tier ? VALUE_TIER_CONFIG[trend.value_tier] : null;
  const isCrossPlatform = trend.cross_platform && trend.cross_platform.platforms.length >= 2;

  return (
    <div className={`group rounded-lg border p-4 transition-colors ${
      isCrossPlatform
        ? 'border-[#ffd700]/30 bg-[#12121a] hover:border-[#ffd700]/50 ring-1 ring-[#ffd700]/10'
        : isRejected
        ? 'border-white/[0.03] bg-[#18181f]/40 opacity-40'
        : isLowValue
        ? 'border-white/[0.03] bg-[#12121a]/50 opacity-50'
        : 'border-white/5 bg-[#12121a] hover:border-white/10'
    }`}>
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: source.color }}
          />
          <span className="text-[10px] uppercase tracking-wider text-white/30">
            {source.label}
            {trend.subreddit && ` r/${trend.subreddit}`}
          </span>
          <span className="text-[10px] text-white/20">{timeAgo}</span>
          {/* Cross-Platform Badge */}
          {isCrossPlatform && (
            <Badge className="bg-[#ffd700]/15 text-[10px] text-[#ffd700] border-[#ffd700]/30">
              {'\u{1F310}'} {trend.cross_platform!.platforms.length} platforms
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {tierConfig && (
            <Badge className={`text-[10px] font-medium ${tierConfig.className}`}>
              {tierConfig.emoji} {tierConfig.label}
            </Badge>
          )}
          {trend.ai_score?.content_format && (
            <Badge variant="outline" className="border-[#4d8aff]/30 text-[9px] font-mono text-[#4d8aff]/70">
              {FORMAT_LABELS[trend.ai_score.content_format] || trend.ai_score.content_format}
            </Badge>
          )}
          <div className={`font-mono text-sm font-bold ${
            isLowValue ? 'text-white/20' :
            trend.combined_score >= 70 ? 'text-[#00e68a]' :
            trend.combined_score >= 40 ? 'text-yellow-400' : 'text-[#ff4d6a]'
          }`}>
            {trend.combined_score}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className={`mb-1 text-sm leading-snug ${isLowValue ? 'text-white/30' : 'text-white/90'}`}>
        {trend.title}
      </h3>

      {/* Suggested Angle */}
      {trend.ai_score?.suggested_angle && (
        <p className={`mb-3 text-[11px] leading-snug ${isLowValue ? 'text-white/15' : 'text-white/35'}`}>
          {trend.ai_score.suggested_angle}
        </p>
      )}

      {/* Polymarket-specific metrics */}
      {trend.source === 'polymarket' && trend.extra ? (
        <div className="mb-3 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-mono text-[#a855f7]">
            {'\u{1F4B0}'} ${formatVolume(trend.extra.volume_usd as number)}
          </span>
          <span className="flex items-center gap-1 font-mono text-white/50">
            {'\u{1F4CA}'} {trend.extra.probability as number}% {trend.extra.trending_direction === 'up' ? '\u2191' : '\u2193'}
          </span>
          <span className="font-mono text-white/30">
            {(trend.extra.traders as number)?.toLocaleString()} traders
          </span>
          {(trend.extra.volume_usd as number) >= 500000 && (
            <Badge className="bg-orange-500/20 text-[10px] text-orange-400 border-orange-500/30">
              {'\u{1F525}'} Hot Money
            </Badge>
          )}
        </div>
      ) : (
        <div className="mb-3 flex items-center gap-4 text-xs text-white/30">
          <span className="flex items-center gap-1 font-mono">
            <TrendingUp className="h-3 w-3" />
            {trend.score.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <MessageCircle className="h-3 w-3" />
            {trend.comments.toLocaleString()}
          </span>
          <span className="text-white/15">by {trend.author}</span>
        </div>
      )}

      {/* Multi-Signal Breakdown */}
      {trend.signals && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          <SignalPill label="AI" value={trend.signals.ai_analysis} />
          {/* Velocity with tier badge */}
          {trend.velocity_tier && (
            <span className="inline-flex items-center gap-0.5 rounded border border-white/10 px-1.5 py-0.5"
              style={{ color: VELOCITY_CONFIG[trend.velocity_tier].color }}>
              Vel:{VELOCITY_CONFIG[trend.velocity_tier].emoji}
            </span>
          )}
          <SignalPill label="Talk" value={trend.signals.comments_ratio} />
          {/* Cross-platform */}
          {trend.cross_platform && trend.cross_platform.platforms.length >= 2 ? (
            <span className="inline-flex items-center gap-0.5 rounded border border-[#ffd700]/30 px-1.5 py-0.5 text-[#ffd700]">
              {'\u{1F310}'}&times;{trend.cross_platform.platforms.length}
            </span>
          ) : (
            <SignalPill label="\u{1F310}" value={trend.signals.cross_platform} />
          )}
          {/* Emotional trigger */}
          {trend.ai_score?.emotional_trigger && trend.ai_score.emotional_trigger !== 'none' && (
            <span className="inline-flex items-center rounded border border-white/10 px-1.5 py-0.5 text-white/50">
              {EMOTION_CONFIG[trend.ai_score.emotional_trigger]?.emoji}
            </span>
          )}
          <SignalPill label="Fresh" value={trend.signals.freshness} />
          {isRejected && (
            <Badge className="bg-[#ff4d6a]/15 text-[10px] text-[#ff4d6a]">
              LOW VALUE
            </Badge>
          )}
        </div>
      )}

      {/* Legacy AI scores (if no signals yet but has ai_score) */}
      {!trend.signals && trend.ai_score && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <ScoreBadge label="Value" value={trend.ai_score.content_value} />
          <ScoreBadge label="Niche" value={trend.ai_score.niche_fit} />
          <ScoreBadge label="Hook" value={trend.ai_score.hook_potential} />
          <ScoreBadge label="Action" value={trend.ai_score.actionability} />
          {isRejected && (
            <Badge className="bg-[#ff4d6a]/15 text-[10px] text-[#ff4d6a]">
              LOW VALUE
            </Badge>
          )}
        </div>
      )}

      {/* Cross-platform source dots */}
      {isCrossPlatform && (
        <div className="mb-3 flex items-center gap-1">
          <span className="text-[9px] text-[#ffd700]/60 mr-1">Also on:</span>
          {trend.cross_platform!.platforms
            .filter((p) => p !== trend.source)
            .map((p) => {
              const cfg = SOURCE_CONFIG[p];
              return cfg ? (
                <span key={p} className="flex items-center gap-0.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <span className="text-[9px] text-white/30">{cfg.label}</span>
                </span>
              ) : null;
            })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <ActionButton
          icon={Target}
          label="To Factory"
          onClick={() => {
            const params = new URLSearchParams({
              trend_id: trend.id,
              trend_title: trend.title,
              trend_source: trend.source,
            });
            router.push(`/factory?${params}`);
          }}
        />
        <ActionButton
          icon={ExternalLink}
          label="View"
          onClick={() => window.open(trend.url, '_blank')}
        />
        <ActionButton
          icon={Star}
          label={trend.saved ? 'Saved' : 'Save'}
          active={trend.saved}
          onClick={() => onSave?.(trend.id)}
        />
      </div>
    </div>
  );
}

function SignalPill({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? '#00e68a' : value >= 40 ? '#ffd93d' : '#ff4d6a';
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded border border-white/10 px-1.5 py-0.5"
      style={{ color }}
    >
      {label}:{value}
    </span>
  );
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? '#00e68a' : value >= 40 ? '#ffd93d' : '#ff4d6a';
  return (
    <Badge variant="outline" className="border-white/10 text-[10px] font-mono" style={{ color }}>
      {label} {value}
    </Badge>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] transition-colors ${
        active
          ? 'bg-[#00e68a]/10 text-[#00e68a]'
          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
      }`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}

function formatVolume(usd: number): string {
  if (!usd || usd <= 0) return '$0';
  if (usd >= 1_000_000) return `${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `${(usd / 1_000).toFixed(0)}K`;
  return usd.toFixed(0);
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
