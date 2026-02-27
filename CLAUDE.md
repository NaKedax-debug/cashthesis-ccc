# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

CashThesis is a Content Command Center for a faceless YouTube/TikTok channel.
Niche: AI + Money + Vibe Coding + Crypto.
Owner: Valerii (beginner content creator, experienced in AI/crypto).
Language preference: Russian for UI text and comments where needed.

Locally-hosted SPA on Windows (Ryzen 5 + RTX 3060, 128GB RAM). The spec is in `cashthesis-ccc-spec.md` at the repo root.

## Content Pipeline

1. Trend Radar finds trending topics from 6 sources
2. AI scores them with 6-signal Multi-Signal Scoring
3. Content Factory generates scripts for each platform
4. Funnel Builder adds affiliate monetization
5. Analytics tracks AI costs and performance

## Commands

All commands run from `cashthesis-ccc/`:

```bash
npm run dev          # Start dev server at localhost:3000
npm run dev:clean    # Delete .next cache then start dev server
npm run build        # Production build
npm run start        # Run production build
npm run lint         # ESLint (next/core-web-vitals + next/typescript)
```

No test framework is configured.

## Tech Stack

- **Next.js 14** (App Router), React 18, TypeScript (strict)
- **Tailwind CSS** + **shadcn/ui** (Radix UI primitives in `components/ui/`)
- **SQLite** via `better-sqlite3` (WAL mode, file at `data/cashthesis.db`)
- **Recharts** for charts, **Zustand** installed but unused (all state is local React hooks)
- **Lucide React** for icons
- Path alias: `@/*` maps to project root

## Architecture

### Three-Phase Product Structure

All types are defined in `types/index.ts` organized by phase:

1. **Trend Radar** (`/`) — fetch trends from 6 sources, AI-score them, display sorted
2. **Content Factory** (`/factory`) — generate multi-platform content plans from trends via Claude
3. **Funnel Builder** (`/funnel`) — manage conversion funnels and affiliate links

Plus `/analytics` (cost analytics) and `/settings` (read-only env display).

### Data Flow: Sources → Cache → AI Scoring → Multi-Signal Assembly → UI

1. `GET /api/trends` fires all 6 source adapters in parallel via `Promise.allSettled()`:
   - **Reddit** (`lib/sources/reddit.ts`) — public JSON API, 10 subreddits, no key needed
   - **Hacker News** (`lib/sources/hackernews.ts`) — Firebase API, top 30 stories
   - **YouTube** (`lib/sources/youtube.ts`) — Data API v3, requires `YOUTUBE_API_KEY`
   - **Product Hunt**, **Twitter/X**, **Polymarket** (`lib/sources/producthunt.ts`, `twitter.ts`, `polymarket.ts`) — AI-synthesized via Perplexity Sonar (no direct API)

2. Raw results normalized to `TrendItem` interface, cached in `trends_cache` table (UPSERT). Snapshots written to `trend_snapshots` for velocity tracking.

3. `POST /api/analyze` sends batches of up to 25 trends to Perplexity Sonar for scoring → results stored in `trend_scores` table (and legacy `ai_scores`).

4. `lib/scoring.ts` assembles a 6-signal combined score per trend:
   - `ai_analysis` (30%) — from Sonar scoring
   - `velocity` (20%) — delta from DB snapshots
   - `comments_ratio` (15%) — engagement density
   - `cross_platform` (15%) — how many platforms mention the topic
   - `emotional` (10%) — trigger type from AI
   - `freshness` (10%) — age decay

5. Client fetches `ScoredTrend[]`, applies time/source filters client-side, renders `TrendCard` grid.

### AI Integration

- **Anthropic Claude** (`lib/ai/anthropic.ts`) — `POST /v1/messages`, default model `claude-3-haiku-20240307`. Used by `/api/factory` for content plan generation.
- **Perplexity Sonar** (`lib/ai/perplexity.ts`) — `POST /chat/completions`, model `sonar`. Used for trend scoring, cross-platform detection, and synthesizing Product Hunt/Twitter/Polymarket data.
- **Usage Tracker** (`lib/ai/usage-tracker.ts`) — every AI call logged to `api_usage` table. `getCostSummary()` aggregates today/week/month costs.

### Database

SQLite, no ORM — raw SQL everywhere. Key tables: `trends_cache`, `trend_scores`, `ai_scores` (legacy), `trend_snapshots`, `saved_trends`, `api_usage`, `content_plans`, `affiliate_links`, `funnels`. Schema initialized in `lib/db.ts` via `getDb()` singleton.

Complex data (funnel step trees, platform content arrays, SEO keywords) stored as JSON text columns.

### Component Hierarchy

```
app/layout.tsx → <Sidebar /> + <main>{page}</main>
Radar page: SourceFilter | TrendList → TrendCard[] | VelocityChart + CostWidget
Factory page: PlanList | PlatformContentView (tabbed: TikTok/YT/IG/Threads/Twitter)
Funnel page: Tabs(Funnels|Affiliates) → FunnelListPanel/FunnelEditor/AffiliatePanel
```

No global state store — each page manages its own state via `useState`/`useEffect`. `CostWidget` polls `/api/usage` every 60s. `TrendList` auto-refreshes on `NEXT_PUBLIC_REFRESH_INTERVAL` (default 30 min).

## Conventions

- **ID generation**: `{type}-{Date.now()}-{random}` for entities; `{source}-{originalId}` for trends
- **All external API calls** go through Next.js API routes (server-side only)
- **Error strategy**: `Promise.allSettled()` for parallel fetches; sources return `[]` on failure; API routes return `{ error }` with status codes
- **AI prompts** defined as top-level constants; both wrappers strip markdown code fences before `JSON.parse()`
- **Dark theme only**: bg `#0a0a0f`, surface `#12121a`, green `#00e68a`, red `#ff4d6a`, blue `#4d8aff`, gold `#ffd700`
- **`cn()` helper** (`lib/utils.ts`) used everywhere for className merging (clsx + tailwind-merge)
- **Env vars**: API keys in `.env.local` — `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `YOUTUBE_API_KEY`, `PRODUCTHUNT_TOKEN`, `NEXT_PUBLIC_REFRESH_INTERVAL`, `NEXT_PUBLIC_MONTHLY_BUDGET`

## Integration Points

- **OpenClaw** (Telegram bot) — 4 agents: Chief, Searchy, Goaly, Cashy
- **Genviral API** — TikTok/YouTube auto-publishing
- **Nano Banana** — AI image generation for slideshows
- **Bybit affiliate** — crypto trading (main monetization)

## Important Rules

- ALWAYS log AI API costs via `trackUsage()` in `lib/ai/usage-tracker.ts`
- Monthly AI budget: $30. Alert when >80%
- Sonar API for trend synthesis costs ~$0.001/call — use freely for data enrichment
- Claude Haiku for content generation costs ~$0.01/call — use for Factory scripts
- Never call Claude Sonnet/Opus from automated pipelines (too expensive for batch)
- All API keys server-side only (Next.js API routes), never expose to client
