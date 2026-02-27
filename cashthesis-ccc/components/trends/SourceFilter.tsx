'use client';

import { Checkbox } from '@/components/ui/checkbox';
import type { FilterState, TrendSource, Niche, TimeFilter, SortBy } from '@/types';

const NICHES: { id: Niche; label: string }[] = [
  { id: 'ai', label: 'AI' },
  { id: 'money', label: 'Money' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'vibecoding', label: 'Vibe Coding' },
];

const SOURCES: { id: TrendSource; label: string; color: string }[] = [
  { id: 'reddit', label: 'Reddit', color: '#ff4500' },
  { id: 'hackernews', label: 'HN', color: '#ff6600' },
  { id: 'youtube', label: 'YouTube', color: '#ff0000' },
  { id: 'producthunt', label: 'PH', color: '#da552f' },
  { id: 'twitter', label: 'X / Twitter', color: '#1d9bf0' },
  { id: 'polymarket', label: 'Polymarket', color: '#a855f7' },
];

const TIME_OPTIONS: { id: TimeFilter; label: string }[] = [
  { id: '1h', label: '1h' },
  { id: '6h', label: '6h' },
  { id: '24h', label: '24h' },
  { id: '7d', label: '7d' },
];

const SORT_OPTIONS: { id: SortBy; label: string; emoji: string }[] = [
  { id: 'combined', label: 'Score', emoji: '\u{2B50}' },
  { id: 'velocity', label: 'Velocity', emoji: '\u{1F680}' },
  { id: 'cross_platform', label: 'Multi-src', emoji: '\u{1F310}' },
  { id: 'freshness', label: 'Fresh', emoji: '\u{23F0}' },
];

interface SourceFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function SourceFilter({ filters, onChange }: SourceFilterProps) {
  const toggleNiche = (niche: Niche) => {
    const niches = filters.niches.includes(niche)
      ? filters.niches.filter((n) => n !== niche)
      : [...filters.niches, niche];
    onChange({ ...filters, niches });
  };

  const toggleSource = (source: TrendSource) => {
    const sources = filters.sources.includes(source)
      ? filters.sources.filter((s) => s !== source)
      : [...filters.sources, source];
    if (sources.length > 0) onChange({ ...filters, sources });
  };

  const setTime = (time: TimeFilter) => {
    onChange({ ...filters, time });
  };

  const setSortBy = (sortBy: SortBy) => {
    onChange({ ...filters, sortBy });
  };

  const toggleHideRejected = () => {
    onChange({ ...filters, hideRejected: !filters.hideRejected });
  };

  return (
    <div className="space-y-5">
      {/* Niches */}
      <div>
        <h3 className="mb-2 text-[10px] uppercase tracking-widest text-white/30">
          Niche
        </h3>
        <div className="space-y-2">
          {NICHES.map((niche) => (
            <label
              key={niche.id}
              className="flex cursor-pointer items-center gap-2 text-xs text-white/50 hover:text-white/70"
            >
              <Checkbox
                checked={filters.niches.includes(niche.id)}
                onCheckedChange={() => toggleNiche(niche.id)}
                className="h-3.5 w-3.5 border-white/20"
              />
              {niche.label}
            </label>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div>
        <h3 className="mb-2 text-[10px] uppercase tracking-widest text-white/30">
          Sources
        </h3>
        <div className="space-y-2">
          {SOURCES.map((source) => (
            <label
              key={source.id}
              className="flex cursor-pointer items-center gap-2 text-xs text-white/50 hover:text-white/70"
            >
              <Checkbox
                checked={filters.sources.includes(source.id)}
                onCheckedChange={() => toggleSource(source.id)}
                className="h-3.5 w-3.5 border-white/20"
              />
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: source.color }}
              />
              {source.label}
            </label>
          ))}
        </div>
      </div>

      {/* Time Filter */}
      <div>
        <h3 className="mb-2 text-[10px] uppercase tracking-widest text-white/30">
          Time Range
        </h3>
        <div className="flex gap-1">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTime(opt.id)}
              className={`rounded px-2 py-1 text-[10px] font-mono transition-colors ${
                filters.time === opt.id
                  ? 'bg-[#00e68a]/10 text-[#00e68a]'
                  : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="mb-2 text-[10px] uppercase tracking-widest text-white/30">
          Sort By
        </h3>
        <div className="flex flex-wrap gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`rounded px-2 py-1 text-[10px] font-mono transition-colors ${
                filters.sortBy === opt.id
                  ? 'bg-[#4d8aff]/15 text-[#4d8aff]'
                  : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50'
              }`}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scoring Filter */}
      <div>
        <h3 className="mb-2 text-[10px] uppercase tracking-widest text-white/30">
          Scoring
        </h3>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-white/50 hover:text-white/70">
          <Checkbox
            checked={filters.hideRejected}
            onCheckedChange={toggleHideRejected}
            className="h-3.5 w-3.5 border-white/20"
          />
          Hide rejected
        </label>
      </div>
    </div>
  );
}
