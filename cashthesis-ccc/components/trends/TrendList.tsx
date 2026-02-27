'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Loader2, Zap } from 'lucide-react';
import { TrendCard } from './TrendCard';
import { Button } from '@/components/ui/button';
import type { ScoredTrend, FilterState } from '@/types';

interface TrendListProps {
  filters: FilterState;
  onTrendsLoaded?: (trends: ScoredTrend[]) => void;
}

export function TrendList({ filters, onTrendsLoaded }: TrendListProps) {
  const [trends, setTrends] = useState<ScoredTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState('');
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sources: filters.sources.join(','),
      });
      const res = await fetch(`/api/trends?${params}`);
      if (res.ok) {
        const data = await res.json();
        const fetched = data.trends ?? [];
        setTrends(fetched);
        setLastFetch(new Date());
        onTrendsLoaded?.(fetched);
      }
    } catch (err) {
      console.error('Failed to fetch trends:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.sources, onTrendsLoaded]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  useEffect(() => {
    const interval = parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL ?? '1800000');
    const timer = setInterval(fetchTrends, interval);
    return () => clearInterval(timer);
  }, [fetchTrends]);

  const analyzeAll = async () => {
    if (trends.length === 0) return;
    setAnalyzing(true);
    setAnalyzeProgress('');

    try {
      const unscored = trends.filter((t) => !t.ai_score);
      const toAnalyze = unscored.length > 0 ? unscored : trends;
      const batchSize = 25;
      const totalBatches = Math.ceil(toAnalyze.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const batch = toAnalyze.slice(i * batchSize, (i + 1) * batchSize);
        const isLastBatch = i === totalBatches - 1;
        setAnalyzeProgress(`Batch ${i + 1}/${totalBatches} (${batch.length} trends)`);

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trends: batch,
            // Run cross-platform detection only on last batch with all trends
            detectCrossPlatform: isLastBatch,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          console.error(`Batch ${i + 1} failed:`, err);
        }
      }

      setAnalyzeProgress('Refreshing...');
      await fetchTrends();
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
      setAnalyzeProgress('');
    }
  };

  const handleSave = async (id: string) => {
    const trend = trends.find((t) => t.id === id);
    if (!trend) return;
    const newSaved = !trend.saved;
    setTrends((prev) =>
      prev.map((t) => (t.id === id ? { ...t, saved: newSaved } : t))
    );
    try {
      await fetch('/api/trends/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trend_id: id, saved: newSaved }),
      });
    } catch {
      setTrends((prev) =>
        prev.map((t) => (t.id === id ? { ...t, saved: !newSaved } : t))
      );
    }
  };

  // Filter
  const timeFilteredTrends = filterByTime(trends, filters.time);
  const visibleTrends = filters.hideRejected
    ? timeFilteredTrends.filter((t) => !t.ai_score?.reject)
    : timeFilteredTrends;

  // Sort
  const sortedTrends = sortTrends(visibleTrends, filters.sortBy);
  const displayTrends = sortedTrends.slice(0, filters.limit || 50);

  // Counts
  const highCount = timeFilteredTrends.filter((t) => t.value_tier === 'high').length;
  const maybeCount = timeFilteredTrends.filter((t) => t.value_tier === 'maybe').length;
  const skipCount = timeFilteredTrends.filter((t) => t.value_tier === 'skip').length;
  const rejectedCount = timeFilteredTrends.filter((t) => t.ai_score?.reject).length;
  const crossPlatformCount = timeFilteredTrends.filter(
    (t) => t.cross_platform && t.cross_platform.platforms.length >= 2
  ).length;
  const hasTiers = timeFilteredTrends.some((t) => t.value_tier);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white/90">Trending Now</h2>
          {lastFetch && (
            <span className="text-[10px] text-white/20" suppressHydrationWarning>
              Updated {lastFetch.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeAll}
            disabled={analyzing || trends.length === 0}
            className="border-white/10 bg-transparent text-xs text-white/50 hover:bg-white/5 hover:text-white/80"
          >
            {analyzing ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Zap className="mr-1 h-3 w-3" />
            )}
            {analyzing ? (analyzeProgress || 'Scoring...') : 'AI Score All'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTrends}
            disabled={loading}
            className="border-white/10 bg-transparent text-xs text-white/50 hover:bg-white/5 hover:text-white/80"
          >
            {loading ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 h-3 w-3" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Count + tier + cross-platform breakdown */}
      <p className="mb-3 text-xs text-white/20">
        {displayTrends.length} of {timeFilteredTrends.length} trends
        {filters.hideRejected && rejectedCount > 0 && (
          <span className="text-white/15"> ({rejectedCount} hidden)</span>
        )}
        {hasTiers && (
          <span className="ml-2">
            <span className="text-[#00e68a]">{highCount} high</span>
            {' \u00b7 '}
            <span className="text-yellow-400">{maybeCount} maybe</span>
            {' \u00b7 '}
            <span className="text-[#ff4d6a]">{skipCount} skip</span>
          </span>
        )}
        {crossPlatformCount > 0 && (
          <span className="ml-2 text-[#ffd700]">
            {'\u{1F310}'} {crossPlatformCount} cross-platform
          </span>
        )}
      </p>

      {/* Grid */}
      {loading && trends.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-white/20">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Fetching trends...
        </div>
      ) : displayTrends.length === 0 ? (
        <div className="py-20 text-center text-white/20">
          No trends found. Try adjusting filters.
        </div>
      ) : (
        <div className="grid gap-3">
          {displayTrends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  );
}

function filterByTime(trends: ScoredTrend[], time: string): ScoredTrend[] {
  const now = Date.now() / 1000;
  const cutoffs: Record<string, number> = {
    '1h': 3600, '6h': 21600, '24h': 86400, '7d': 604800,
  };
  const cutoff = cutoffs[time] ?? 86400;
  return trends.filter((t) => now - t.timestamp < cutoff);
}

function sortTrends(trends: ScoredTrend[], sortBy: string): ScoredTrend[] {
  const sorted = [...trends];
  switch (sortBy) {
    case 'velocity':
      return sorted.sort((a, b) => (b.signals?.velocity ?? 0) - (a.signals?.velocity ?? 0));
    case 'cross_platform':
      return sorted.sort((a, b) => (b.signals?.cross_platform ?? 0) - (a.signals?.cross_platform ?? 0));
    case 'freshness':
      return sorted.sort((a, b) => (b.signals?.freshness ?? 0) - (a.signals?.freshness ?? 0));
    case 'combined':
    default:
      return sorted; // already sorted by combined in API
  }
}
