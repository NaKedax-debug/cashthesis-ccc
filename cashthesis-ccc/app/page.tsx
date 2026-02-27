'use client';

import { useState, useCallback } from 'react';
import { TrendList } from '@/components/trends/TrendList';
import { SourceFilter } from '@/components/trends/SourceFilter';
import { CostWidget } from '@/components/layout/CostWidget';
import { VelocityChart } from '@/components/trends/VelocityChart';
import type { FilterState, ScoredTrend } from '@/types';

const DEFAULT_FILTERS: FilterState = {
  niches: ['ai', 'money', 'crypto', 'vibecoding'],
  sources: ['reddit', 'hackernews', 'youtube', 'producthunt', 'twitter', 'polymarket'],
  time: '24h',
  limit: 50,
  hideRejected: true,
  sortBy: 'combined',
};

export default function RadarPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [trends, setTrends] = useState<ScoredTrend[]>([]);

  const handleTrendsLoaded = useCallback((loaded: ScoredTrend[]) => {
    setTrends(loaded);
  }, []);

  return (
    <div className="flex h-full">
      {/* Left sidebar filters */}
      <div className="w-[180px] shrink-0 border-r border-white/5 p-4">
        <SourceFilter filters={filters} onChange={setFilters} />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <TrendList filters={filters} onTrendsLoaded={handleTrendsLoaded} />
        {trends.length > 0 && (
          <div className="mt-6">
            <VelocityChart trends={trends} />
          </div>
        )}
      </div>

      {/* Right sidebar — cost widget */}
      <div className="w-[200px] shrink-0 border-l border-white/5 p-4">
        <CostWidget />
      </div>
    </div>
  );
}
