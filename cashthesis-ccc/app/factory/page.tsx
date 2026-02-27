'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Factory,
  Loader2,
  Sparkles,
  Clock,
  Hash,
  Copy,
  Check,
  ChevronLeft,
  FileText,
  Film,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ContentPlan, ContentPlanSummary, Platform, PlatformContent } from '@/types';

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; icon: string }> = {
  tiktok: { label: 'TikTok', color: '#00f2ea', icon: '♪' },
  youtube_shorts: { label: 'YT Shorts', color: '#ff0000', icon: '▶' },
  instagram_reels: { label: 'IG Reels', color: '#e4405f', icon: '◎' },
  threads: { label: 'Threads', color: '#ffffff', icon: '@' },
  twitter: { label: 'X / Twitter', color: '#1da1f2', icon: '𝕏' },
};

export default function FactoryPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center text-white/20">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading...
      </div>
    }>
      <FactoryContent />
    </Suspense>
  );
}

function FactoryContent() {
  const searchParams = useSearchParams();
  const trendId = searchParams.get('trend_id');
  const trendTitle = searchParams.get('trend_title');
  const trendSource = searchParams.get('trend_source');

  const [plans, setPlans] = useState<ContentPlanSummary[]>([]);
  const [activePlan, setActivePlan] = useState<ContentPlan | null>(null);
  const [activePlatform, setActivePlatform] = useState<Platform>('tiktok');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoPrompt, setVideoPrompt] = useState<string | null>(null);
  const [videoPromptLoading, setVideoPromptLoading] = useState(false);
  const [videoPromptMeta, setVideoPromptMeta] = useState<{ detectedFormat: string; estimatedDuration: string } | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/factory');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Auto-generate if arriving from Radar with trend params
  useEffect(() => {
    if (trendId && trendTitle && !generating && !activePlan) {
      generatePlan(trendId, trendTitle, trendSource ?? 'reddit');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendId, trendTitle]);

  const generatePlan = async (id: string, title: string, source: string) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/factory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trend_id: id,
          trend_title: title,
          trend_source: source,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActivePlan(data.plan);
        setActivePlatform(data.plan.platforms[0]?.platform ?? 'tiktok');
        await fetchPlans();
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const loadPlan = async (planId: string) => {
    try {
      const res = await fetch(`/api/factory?id=${planId}`);
      if (res.ok) {
        const data = await res.json();
        setActivePlan(data.plan);
        setActivePlatform(data.plan.platforms[0]?.platform ?? 'tiktok');
      }
    } catch {
      // silent
    }
  };

  const updateStatus = async (status: string) => {
    if (!activePlan) return;
    try {
      await fetch('/api/factory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activePlan.id, status }),
      });
      setActivePlan({ ...activePlan, status: status as ContentPlan['status'] });
      await fetchPlans();
    } catch {
      // silent
    }
  };

  const generateVideoPrompt = async () => {
    if (!activePlan) return;
    setVideoPromptLoading(true);
    setVideoPrompt(null);
    setVideoPromptMeta(null);
    try {
      const res = await fetch('/api/remotion-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trendId: activePlan.trend_id }),
      });
      if (res.ok) {
        const data = await res.json();
        setVideoPrompt(data.prompt);
        setVideoPromptMeta({ detectedFormat: data.detectedFormat, estimatedDuration: data.estimatedDuration });
      } else {
        const data = await res.json();
        console.error('Video prompt error:', data.error);
      }
    } catch (err) {
      console.error('Video prompt generation failed:', err);
    } finally {
      setVideoPromptLoading(false);
    }
  };

  // Generating state
  if (generating) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#00e68a]" />
          <h2 className="text-lg font-bold text-white/60">Generating Content Plan...</h2>
          <p className="mt-1 text-xs text-white/25">Claude Sonnet is crafting scripts for 5 platforms</p>
          {trendTitle && (
            <p className="mt-3 max-w-md text-sm italic text-white/30">&ldquo;{trendTitle}&rdquo;</p>
          )}
        </div>
      </div>
    );
  }

  // Active plan view
  if (activePlan) {
    const currentContent = activePlan.platforms.find((p) => p.platform === activePlatform);

    return (
      <div className="flex h-full">
        {/* Plan sidebar — list */}
        <div className="w-[240px] shrink-0 border-r border-white/5 overflow-y-auto">
          <div className="p-4">
            <button
              onClick={() => setActivePlan(null)}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50"
            >
              <ChevronLeft className="h-3 w-3" />
              All Plans
            </button>
          </div>
          <PlanList plans={plans} activeId={activePlan.id} onSelect={loadPlan} />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/20">Content Plan</p>
                <h1 className="mt-1 text-lg font-bold text-white/90">{activePlan.trend_title}</h1>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="border-white/10 text-[10px] text-white/30">
                    {activePlan.trend_source}
                  </Badge>
                  <StatusBadge status={activePlan.status} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={generateVideoPrompt}
                  disabled={videoPromptLoading}
                  className="bg-[#a855f7]/20 text-xs text-[#a855f7] hover:bg-[#a855f7]/30"
                >
                  {videoPromptLoading ? (
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  ) : (
                    <Film className="mr-1.5 h-3 w-3" />
                  )}
                  {videoPromptLoading ? 'Generating...' : 'Generate Video Prompt'}
                </Button>
                {activePlan.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus('in_production')}
                    className="bg-[#4d8aff]/20 text-xs text-[#4d8aff] hover:bg-[#4d8aff]/30"
                  >
                    Start Production
                  </Button>
                )}
                {activePlan.status === 'in_production' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus('published')}
                    className="bg-[#00e68a]/20 text-xs text-[#00e68a] hover:bg-[#00e68a]/30"
                  >
                    Mark Published
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Platform tabs */}
          <div className="mb-6 flex gap-1">
            {activePlan.platforms.map((p) => {
              const cfg = PLATFORM_CONFIG[p.platform];
              const isActive = p.platform === activePlatform;
              return (
                <button
                  key={p.platform}
                  onClick={() => setActivePlatform(p.platform)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white/90'
                      : 'bg-white/[0.03] text-white/30 hover:bg-white/5 hover:text-white/50'
                  }`}
                >
                  <span style={{ color: cfg?.color }}>{cfg?.icon}</span>
                  {cfg?.label ?? p.platform}
                </button>
              );
            })}
          </div>

          {/* Platform content */}
          {currentContent && <PlatformContentView content={currentContent} />}

          {/* SEO & Hooks */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {/* SEO Keywords */}
            <div className="rounded-lg border border-white/5 bg-[#12121a] p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/30">
                <Hash className="h-3 w-3" />
                SEO Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {activePlan.seo_keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/40"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Hook Variants */}
            <div className="rounded-lg border border-white/5 bg-[#12121a] p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/30">
                <Sparkles className="h-3 w-3" />
                Hook Variants (A/B)
              </h3>
              <div className="space-y-2">
                {activePlan.hook_variants.map((hook, i) => (
                  <div
                    key={i}
                    className="rounded bg-white/[0.03] px-3 py-2 text-xs text-white/50"
                  >
                    <span className="mr-1.5 font-mono text-[10px] text-[#00e68a]">{String.fromCharCode(65 + i)}.</span>
                    {hook}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Remotion Video Prompt */}
          {videoPrompt && (
            <VideoPromptCard
              prompt={videoPrompt}
              detectedFormat={videoPromptMeta?.detectedFormat ?? 'unknown'}
              estimatedDuration={videoPromptMeta?.estimatedDuration ?? '—'}
            />
          )}
        </div>
      </div>
    );
  }

  // Default: plan list view
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Factory className="h-5 w-5 text-white/20" />
          <h1 className="text-lg font-bold text-white/80">Content Factory</h1>
        </div>
        <p className="text-xs text-white/20">
          Select a trend from Radar → &ldquo;To Factory&rdquo; to generate
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/20">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading plans...
        </div>
      ) : plans.length === 0 ? (
        <div className="py-20 text-center">
          <FileText className="mx-auto mb-4 h-10 w-10 text-white/10" />
          <p className="text-sm text-white/25">No content plans yet</p>
          <p className="mt-1 text-xs text-white/15">
            Go to Radar and click &ldquo;To Factory&rdquo; on a trend to generate your first plan
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => loadPlan(plan.id)}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-[#12121a] p-4 text-left transition-colors hover:border-white/10"
            >
              <div>
                <p className="text-sm text-white/80">{plan.trend_title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="border-white/10 text-[10px] text-white/25">
                    {plan.trend_source}
                  </Badge>
                  <StatusBadge status={plan.status} />
                  <span className="text-[10px] text-white/15">
                    {plan.platform_count} platforms
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-white/15" suppressHydrationWarning>
                {new Date(plan.created_at).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function PlanList({
  plans,
  activeId,
  onSelect,
}: {
  plans: ContentPlanSummary[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-0.5 px-2">
      {plans.map((plan) => (
        <button
          key={plan.id}
          onClick={() => onSelect(plan.id)}
          className={`w-full rounded px-3 py-2 text-left text-xs transition-colors ${
            plan.id === activeId
              ? 'bg-white/10 text-white/80'
              : 'text-white/30 hover:bg-white/5 hover:text-white/50'
          }`}
        >
          <p className="truncate">{plan.trend_title}</p>
          <StatusBadge status={plan.status} />
        </button>
      ))}
    </div>
  );
}

function PlatformContentView({ content }: { content: PlatformContent }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const cfg = PLATFORM_CONFIG[content.platform];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="rounded-lg border border-white/5 bg-[#12121a] p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-white/30">Title</h3>
          <CopyBtn onClick={() => copyToClipboard(content.title, 'title')} copied={copied === 'title'} />
        </div>
        <p className="text-sm font-medium text-white/80">{content.title}</p>
      </div>

      {/* Hook */}
      <div className="rounded-lg border border-[#00e68a]/10 bg-[#00e68a]/[0.03] p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#00e68a]/50">
            Hook (first 3 sec)
          </h3>
          <CopyBtn onClick={() => copyToClipboard(content.hook, 'hook')} copied={copied === 'hook'} />
        </div>
        <p className="text-sm font-medium text-[#00e68a]/80">&ldquo;{content.hook}&rdquo;</p>
      </div>

      {/* Script */}
      <div className="rounded-lg border border-white/5 bg-[#12121a] p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-white/30">Script</h3>
          <CopyBtn onClick={() => copyToClipboard(content.script, 'script')} copied={copied === 'script'} />
        </div>
        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-white/60">
          {content.script}
        </pre>
      </div>

      {/* Meta row */}
      <div className="flex gap-4">
        {/* Format */}
        <div className="flex-1 rounded-lg border border-white/5 bg-[#12121a] p-3">
          <p className="text-[10px] uppercase tracking-wider text-white/20">Format</p>
          <p className="mt-0.5 text-xs text-white/50">{content.format}</p>
        </div>

        {/* Duration */}
        <div className="flex-1 rounded-lg border border-white/5 bg-[#12121a] p-3">
          <p className="text-[10px] uppercase tracking-wider text-white/20">Est. Duration</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
            <Clock className="h-3 w-3" />
            {content.estimated_duration}
          </p>
        </div>

        {/* CTA */}
        <div className="flex-1 rounded-lg border border-white/5 bg-[#12121a] p-3">
          <p className="text-[10px] uppercase tracking-wider text-white/20">CTA</p>
          <p className="mt-0.5 text-xs text-white/50">{content.cta}</p>
        </div>
      </div>

      {/* Hashtags */}
      <div className="rounded-lg border border-white/5 bg-[#12121a] p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-white/30">Hashtags</h3>
          <CopyBtn
            onClick={() => copyToClipboard(content.hashtags.map((h) => `#${h}`).join(' '), 'hashtags')}
            copied={copied === 'hashtags'}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {content.hashtags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px]"
              style={{ color: cfg?.color ?? '#fff' }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CopyBtn({ onClick, copied }: { onClick: () => void; copied: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-white/20 hover:bg-white/5 hover:text-white/40"
    >
      {copied ? <Check className="h-3 w-3 text-[#00e68a]" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function VideoPromptCard({
  prompt,
  detectedFormat,
  estimatedDuration,
}: {
  prompt: string;
  detectedFormat: string;
  estimatedDuration: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 rounded-lg border border-[#a855f7]/10 bg-[#a855f7]/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#a855f7]/60">
          <Film className="h-3 w-3" />
          Remotion Video Prompt
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#a855f7]/20 text-[10px] text-[#a855f7]/60">
            {detectedFormat}
          </Badge>
          <Badge variant="outline" className="border-[#a855f7]/20 text-[10px] text-[#a855f7]/60">
            <Clock className="mr-1 h-2.5 w-2.5" />
            {estimatedDuration}
          </Badge>
          <CopyBtn onClick={copyPrompt} copied={copied} />
        </div>
      </div>
      <pre className="max-h-[400px] overflow-y-auto whitespace-pre-wrap rounded bg-[#0a0a0f] p-3 font-mono text-xs leading-relaxed text-white/60">
        {prompt}
      </pre>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'border-white/10 text-white/25',
    in_production: 'border-[#4d8aff]/20 text-[#4d8aff]',
    published: 'border-[#00e68a]/20 text-[#00e68a]',
  };

  return (
    <Badge variant="outline" className={`text-[10px] ${styles[status] ?? styles.draft}`}>
      {status.replace('_', ' ')}
    </Badge>
  );
}
