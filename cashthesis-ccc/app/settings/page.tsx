'use client';

import { Settings } from 'lucide-react';

interface APIKeyConfig {
  name: string;
  envVar: string;
  placeholder: string;
  testEndpoint?: string;
}

const API_KEYS: APIKeyConfig[] = [
  {
    name: 'Anthropic (Claude)',
    envVar: 'ANTHROPIC_API_KEY',
    placeholder: 'sk-ant-...',
  },
  {
    name: 'Perplexity (Sonar)',
    envVar: 'PERPLEXITY_API_KEY',
    placeholder: 'pplx-...',
  },
  {
    name: 'YouTube Data API',
    envVar: 'YOUTUBE_API_KEY',
    placeholder: 'AIza...',
  },
  {
    name: 'Product Hunt (optional)',
    envVar: 'PRODUCTHUNT_TOKEN',
    placeholder: 'Token...',
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-8 flex items-center gap-3">
        <Settings className="h-5 w-5 text-white/30" />
        <h1 className="text-lg font-bold text-white/80">Settings</h1>
      </div>

      {/* API Keys */}
      <section className="mb-8">
        <h2 className="mb-4 text-xs uppercase tracking-widest text-white/30">
          API Keys
        </h2>
        <p className="mb-4 text-xs text-white/20">
          API keys are stored in .env.local and loaded server-side. Edit the file directly to change them.
        </p>
        <div className="space-y-3">
          {API_KEYS.map((key) => (
            <div
              key={key.envVar}
              className="rounded-lg border border-white/5 bg-[#12121a] p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">{key.name}</p>
                  <p className="font-mono text-[10px] text-white/20">{key.envVar}</p>
                </div>
                <StatusIndicator envVar={key.envVar} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Refresh Interval */}
      <section className="mb-8">
        <h2 className="mb-4 text-xs uppercase tracking-widest text-white/30">
          Auto-Refresh
        </h2>
        <div className="rounded-lg border border-white/5 bg-[#12121a] p-3">
          <p className="text-sm text-white/60">Refresh interval</p>
          <p className="font-mono text-xs text-white/30">
            NEXT_PUBLIC_REFRESH_INTERVAL = 1800000 (30 min)
          </p>
        </div>
      </section>

      {/* Budget */}
      <section className="mb-8">
        <h2 className="mb-4 text-xs uppercase tracking-widest text-white/30">
          Monthly Budget
        </h2>
        <div className="rounded-lg border border-white/5 bg-[#12121a] p-3">
          <p className="text-sm text-white/60">AI spending budget</p>
          <p className="font-mono text-xs text-white/30">
            NEXT_PUBLIC_MONTHLY_BUDGET = $30.00
          </p>
        </div>
      </section>

      {/* Subreddits */}
      <section>
        <h2 className="mb-4 text-xs uppercase tracking-widest text-white/30">
          Monitored Subreddits
        </h2>
        <div className="rounded-lg border border-white/5 bg-[#12121a] p-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              'artificial', 'ChatGPT', 'ClaudeAI', 'LocalLLaMA',
              'SideProject', 'passive_income', 'entrepreneur',
              'vibecoding', 'webdev', 'cryptocurrency',
            ].map((sub) => (
              <span
                key={sub}
                className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/40"
              >
                r/{sub}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StatusIndicator({ envVar }: { envVar: string }) {
  return (
    <span className="text-[10px] text-white/20">
      Configured in .env.local
    </span>
  );
}
