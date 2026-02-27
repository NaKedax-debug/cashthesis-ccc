'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ScoredTrend } from '@/types';

interface VelocityChartProps {
  trends: ScoredTrend[];
}

export function VelocityChart({ trends }: VelocityChartProps) {
  // Extract top keywords and their velocity (based on frequency + score)
  const keywords = extractKeywords(trends);
  const data = keywords.slice(0, 8);

  if (data.length === 0) return null;

  return (
    <div className="rounded-lg border border-white/5 bg-[#12121a] p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/30">
        Trend Velocity
      </h3>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
            <XAxis
              type="number"
              hide
              domain={[0, 'dataMax']}
            />
            <YAxis
              type="category"
              dataKey="keyword"
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }}
              width={80}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.7)',
              }}
              formatter={(value) => [`Score: ${value}`, '']}
            />
            <Bar dataKey="velocity" radius={[0, 4, 4, 0]} barSize={14}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.velocity, data[0].velocity)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function extractKeywords(trends: ScoredTrend[]): Array<{ keyword: string; velocity: number }> {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'it', 'to', 'in', 'for', 'of', 'and', 'on', 'with',
    'my', 'i', 'how', 'what', 'why', 'this', 'that', 'just', 'your', 'our', 'has',
    'have', 'show', 'hn', 'ask', 'from', 'you', 'are', 'was', 'not', 'but', 'or',
    'be', 'can', 'do', 'will', 'all', 'new', 'its', 'about', 'more', 'some', 'than',
    'by', 'using', 'built', 'use', 'get', 'now', 'after', 'first', 'into', 'over',
  ]);

  const keywordMap = new Map<string, number>();

  for (const trend of trends) {
    const words = trend.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    for (const word of words) {
      const current = keywordMap.get(word) ?? 0;
      keywordMap.set(word, current + (trend.combined_score || 1));
    }
  }

  return Array.from(keywordMap.entries())
    .map(([keyword, velocity]) => ({ keyword, velocity }))
    .sort((a, b) => b.velocity - a.velocity);
}

function getBarColor(value: number, maxValue: number): string {
  const ratio = value / maxValue;
  if (ratio > 0.7) return '#00e68a';
  if (ratio > 0.4) return '#4d8aff';
  return '#ffffff20';
}
