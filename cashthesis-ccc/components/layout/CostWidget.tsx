'use client';

import { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';
import type { CostSummary } from '@/types';

export function CostWidget() {
  const [costs, setCosts] = useState<CostSummary | null>(null);

  useEffect(() => {
    fetchCosts();
    const interval = setInterval(fetchCosts, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function fetchCosts() {
    try {
      const res = await fetch('/api/usage');
      if (res.ok) setCosts(await res.json());
    } catch {
      // silent fail
    }
  }

  const budget = costs?.budget ?? 30;
  const monthSpent = costs?.month ?? 0;
  const pct = Math.min((monthSpent / budget) * 100, 100);

  return (
    <div className="rounded-lg border border-white/5 bg-[#12121a] p-3 text-xs">
      <div className="mb-2 flex items-center gap-1.5 text-white/50">
        <DollarSign className="h-3 w-3" />
        <span className="font-medium uppercase tracking-wider">AI Costs</span>
      </div>

      <div className="space-y-1">
        <CostRow label="Today" value={costs?.today ?? 0} />
        <CostRow label="This week" value={costs?.week ?? 0} />
        <CostRow label="Month" value={monthSpent} />
      </div>

      {costs?.by_model && Object.keys(costs.by_model).length > 0 && (
        <div className="mt-2 border-t border-white/5 pt-2 space-y-1">
          {Object.entries(costs.by_model).map(([model, cost]) => (
            <CostRow key={model} label={shortModelName(model)} value={cost} dim />
          ))}
        </div>
      )}

      <div className="mt-2 border-t border-white/5 pt-2">
        <div className="flex justify-between text-white/30">
          <span>Budget</span>
          <span className="font-mono">${budget.toFixed(2)}</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: pct > 80 ? '#ff4d6a' : '#00e68a',
            }}
          />
        </div>
        <p className="mt-0.5 text-right text-[10px] text-white/20 font-mono">
          {pct.toFixed(0)}%
        </p>
      </div>
    </div>
  );
}

function CostRow({ label, value, dim }: { label: string; value: number; dim?: boolean }) {
  return (
    <div className={`flex justify-between ${dim ? 'text-white/20' : 'text-white/40'}`}>
      <span>{label}</span>
      <span className="font-mono text-white/70">${value.toFixed(4)}</span>
    </div>
  );
}

function shortModelName(model: string): string {
  if (model.includes('sonnet')) return 'Sonnet';
  if (model.includes('haiku')) return 'Haiku';
  if (model.includes('sonar-pro')) return 'Sonar Pro';
  if (model.includes('sonar')) return 'Sonar';
  return model;
}
