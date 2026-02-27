# CashThesis Content Command Center — Техническое Задание

## Обзор проекта

**Название:** CashThesis Content Command Center (CCC)
**Тип:** React Web Application (SPA)
**Хостинг:** Локально на ПК (Windows, Ryzen 5 + RTX 3060, 128GB RAM)
**Назначение:** Мониторинг трендов → генерация контент-идей → планирование воронок → публикация через OpenClaw

---

## Архитектура

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                   │
│  Next.js 14 + Tailwind CSS + shadcn/ui              │
│  localhost:3000                                       │
├─────────────────────────────────────────────────────┤
│                   BACKEND (API Routes)               │
│  Next.js API Routes (встроенные)                     │
│  localhost:3000/api/*                                │
├──────────┬──────────┬───────────┬───────────────────┤
│ Sonar API│Claude API│ Reddit API│ Другие источники  │
│ (ресёрч) │(контент) │ (тренды)  │ (HN, YT, etc)    │
└──────────┴──────────┴───────────┴───────────────────┘
```

### Стек технологий

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS + shadcn/ui компоненты
- **State:** Zustand (легковесный state manager)
- **Database:** SQLite через better-sqlite3 (локальная, без сервера)
- **AI Models:** Anthropic Claude API (Sonnet/Haiku), Perplexity Sonar API
- **Charts:** Recharts

---

## MVP Phase 1: Trend Radar

### Экран 1 — Trend Radar Dashboard

#### Источники данных и их API

**1. Reddit**
- API: https://www.reddit.com/r/{subreddit}/hot.json (бесплатно, без ключа)
- Сабреддиты для мониторинга:
  - r/artificial, r/ChatGPT, r/ClaudeAI, r/LocalLLaMA
  - r/SideProject, r/passive_income, r/entrepreneur
  - r/vibecoding, r/webdev, r/cryptocurrency
- Данные: title, score, num_comments, created_utc, url
- Rate limit: 60 запросов/минуту без auth

**2. Hacker News**
- API: https://hacker-news.firebaseio.com/v0/ (бесплатно)
- Endpoints: /topstories.json, /beststories.json, /newstories.json
- Данные: title, score, descendants (comments), url, time
- Без rate limit

**3. Twitter/X**
- Бесплатного API больше нет
- Альтернатива 1: Nitter RSS feeds (если доступно)
- Альтернатива 2: Perplexity Sonar API — запрос "trending AI topics on Twitter today"
- Альтернатива 3: Использовать SocialBlade или другие агрегаторы

**4. YouTube Trending**
- YouTube Data API v3 (бесплатно до 10,000 запросов/день)
- API Key: нужно создать в Google Cloud Console
- Endpoint: /youtube/v3/search?part=snippet&q=AI+tools&type=video&order=viewCount&publishedAfter={24h_ago}
- Данные: title, viewCount, likeCount, publishedAt, channelTitle

**5. Google Trends**
- Нет официального API
- Альтернатива: pytrends (Python библиотека) через API route
- Или Sonar API запрос: "what's trending on Google today in AI and crypto"

**6. Product Hunt**
- API: GraphQL https://api.producthunt.com/v2/api/graphql
- Нужен Developer Token (бесплатно)
- Данные: name, tagline, votesCount, topics, createdAt

#### UI Layout — Trend Radar

```
┌──────────────────────────────────────────────────────────────┐
│ 💰 $0.42 today │ CashThesis Command Center    │ ⚙️ Settings │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│ 📡 Radar   │  🔥 TRENDING NOW          Filter: [AI ▾] [24h ▾]│
│ 📝 Factory │  ┌─────────────────────────────────────────────┐│
│ 🔗 Funnel  │  │ 🔴 Reddit r/ChatGPT                    Score││
│ 📊 Analytics│ │ "Claude Code just replaced our           985││
│            │  │  entire junior dev team"               💬 342││
│ ────────── │  │  [🎯 To Factory] [👁 View] [⭐ Save]        ││
│ НИША:      │  ├─────────────────────────────────────────────┤│
│ ☑ AI       │  │ 🟠 Hacker News                         Score││
│ ☑ Money    │  │ "Show HN: I built a passive income       723││
│ ☑ Crypto   │  │  bot using AI agents"                  💬 156││
│ ☑ VibeCod  │  │  [🎯 To Factory] [👁 View] [⭐ Save]        ││
│            │  ├─────────────────────────────────────────────┤│
│ ИСТОЧНИКИ: │  │ 🟢 Product Hunt                        Votes││
│ ☑ Reddit   │  │ "AutoShorts — AI video generator          412││
│ ☑ HN       │  │  for faceless channels"               💬 89 ││
│ ☑ YouTube  │  │  [🎯 To Factory] [👁 View] [⭐ Save]        ││
│ ☑ PH       │  └─────────────────────────────────────────────┘│
│            │                                                 │
│ 💡 AI Pick │  📊 TREND VELOCITY          🔄 Auto-refresh: 30m│
│ "Top 3     │  ┌─────────────────────────────────────────────┐│
│  trends    │  │ ▓▓▓▓▓▓▓▓░░ AI Agents          +340% 24h   ││
│  worth     │  │ ▓▓▓▓▓▓░░░░ Vibe Coding        +210% 24h   ││
│  covering" │  │ ▓▓▓▓░░░░░░ Claude Code         +180% 24h   ││
│            │  │ ▓▓▓░░░░░░░ Crypto Bots         +95%  24h   ││
│            │  └─────────────────────────────────────────────┘│
└────────────┴─────────────────────────────────────────────────┘
```

#### Функциональность Trend Radar

**Auto-fetch (каждые 30 мин):**
1. Загрузить top/hot посты из Reddit субреддитов
2. Загрузить top stories из HN
3. Загрузить trending из Product Hunt
4. Загрузить trending видео из YouTube (AI/crypto/coding)

**AI Analysis (Sonar API):**
- Для каждой группы постов → отправить в Sonar с промптом:
- "Analyze these trending topics. Score each 1-10 for: virality potential, relevance to AI/Money/Crypto niche, content creation opportunity. Return JSON."
- Стоимость: ~$0.01-0.03 за анализ

**Scoring System:**
- Virality Score (0-100): на основе upvotes, comments, velocity
- Niche Fit (0-100): насколько подходит к AI+Money+VibeCoding
- Content Potential (0-100): насколько легко сделать контент
- Combined Score = weighted average

**Фильтры:**
- По нише: AI, Money, Crypto, Vibe Coding, All
- По времени: 1h, 6h, 24h, 7d
- По источнику: Reddit, HN, YouTube, PH, All
- По Score: Top 10, Top 25, All

**Actions для каждого тренда:**
- 🎯 "To Factory" — отправить в Content Factory (Phase 2)
- 👁 "View" — открыть оригинал
- ⭐ "Save" — сохранить в избранное
- 🤖 "AI Analyze" — глубокий анализ через Claude

---

## Phase 2: Content Factory (после MVP)

### Экран 2 — Content Factory

Выбрал тренд → AI генерирует полный контент-план:

**Input:** Тренд (заголовок + контекст)

**AI Processing (Claude Sonnet):**
Промпт: "На основе этого тренда создай контент-план для faceless канала в нише AI+Money. Для каждой платформы предложи: заголовок, hook (первые 3 секунды), формат видео, скрипт, хештеги, CTA. Платформы: TikTok, YouTube Shorts, Instagram Reels, Threads, Twitter/X."

**Output:**
- Скрипты для каждой платформы
- SEO ключевые слова и хештеги
- Рекомендация формата (slideshow / screen recording / AI video / таймлапс)
- Варианты hook-ов (A/B тест)
- Примерное время производства

---

## Phase 3: Funnel Builder (после Phase 2)

### Экран 3 — Funnel Builder

Для каждого контента — монетизация:

**Affiliate Links Database:**
| Программа | Ниша | Комиссия | Ссылка для регистрации |
|-----------|------|----------|----------------------|
| Bybit | Crypto | до $500/user | bybit.com/affiliates |
| Hostinger | Hosting | $60-150/sale | hostinger.com/affiliate |
| NordVPN | VPN | $3-5/user | nordvpn.com/affiliate |
| Skillshare | Education | $7/trial | skillshare.com/affiliates |
| Amazon | Products | 1-4% | affiliate-program.amazon.com |
| Cursor | AI IDE | TBD | cursor.com |
| Impact.com | Aggregator | Varies | impact.com |
| ShareASale | Aggregator | Varies | shareasale.com |

**Funnel Template:**
```
Контент (шортс/пост)
  → CTA: "Ссылка в био"
    → Linktree / собственный лендинг
      → Affiliate ссылки (tracked)
      → Lead magnet (бесплатный гайд)
        → Email list / Telegram канал
          → Upsell (курс, консультация, копитрейдинг)
```

---

## Phase 4: Analytics (после Phase 3)

### Экран 4 — Analytics Dashboard

- Опубликованный контент и его метрики
- Клики по affiliate ссылкам
- Доход по источникам
- ROI каждого контента

---

## Счётчик расходов AI (все фазы)

### Виджет в правом верхнем углу

```
┌────────────────────┐
│ 💰 AI Costs        │
│ Today:    $0.42    │
│ This week: $2.18   │
│ Month:    $8.73    │
│ ─────────────────  │
│ Sonar:    $3.21    │
│ Sonnet:   $4.89    │
│ Haiku:    $0.63    │
│ Budget:   $30.00   │
│ ▓▓▓▓░░░░░░ 29%    │
└────────────────────┘
```

### Как считать

Каждый API вызов логируется в SQLite:
```sql
CREATE TABLE api_usage (
  id INTEGER PRIMARY KEY,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  provider TEXT,        -- 'anthropic' | 'perplexity'
  model TEXT,           -- 'claude-sonnet-4-5' | 'sonar' | 'sonar-pro'
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd REAL,        -- рассчитанная стоимость
  endpoint TEXT,         -- для какой функции использовался
  trend_id INTEGER       -- связь с конкретным трендом (опционально)
);
```

**Расчёт стоимости:**
```typescript
const PRICING = {
  'claude-sonnet-4-5': { input: 3.0, output: 15.0 },   // per 1M tokens
  'claude-haiku-4-5':  { input: 0.80, output: 4.0 },
  'sonar':             { input: 1.0, output: 1.0 },
  'sonar-pro':         { input: 3.0, output: 15.0 },
};

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const price = PRICING[model];
  return (inputTokens / 1_000_000 * price.input) + (outputTokens / 1_000_000 * price.output);
}
```

---

## Настройка API ключей

### Нужно получить перед началом:

**1. Anthropic API Key**
- Зайти: https://console.anthropic.com/
- Создать API key
- Пополнить баланс на $10
- Записать ключ

**2. Perplexity Sonar API Key**
- Зайти: https://www.perplexity.ai/ → Settings → API
- Создать API key
- Пополнить на $5
- Записать ключ

**3. YouTube Data API Key**
- Зайти: https://console.cloud.google.com/
- Создать проект → Enable YouTube Data API v3
- Создать API key (credentials)
- Бесплатно (10,000 запросов/день)

**4. Product Hunt Developer Token (опционально для MVP)**
- Зайти: https://www.producthunt.com/v2/oauth/applications
- Создать приложение
- Получить Developer Token

### Файл окружения (.env.local)

```env
# AI Models
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...

# Data Sources
YOUTUBE_API_KEY=AIza...
PRODUCTHUNT_TOKEN=...

# Reddit (без ключа для базового доступа)
# Для увеличения лимитов можно создать Reddit App:
# REDDIT_CLIENT_ID=...
# REDDIT_CLIENT_SECRET=...

# Settings
NEXT_PUBLIC_REFRESH_INTERVAL=1800000  # 30 мин в мс
NEXT_PUBLIC_MONTHLY_BUDGET=30.00
```

---

## Команды для Claude Code

### Шаг 1 — Инициализация проекта

```
Создай Next.js 14 проект с TypeScript, Tailwind CSS, shadcn/ui.
Название: cashthesis-ccc
Используй App Router.
Установи зависимости: zustand, better-sqlite3, recharts, lucide-react
Создай базовую структуру:

/app
  /page.tsx              — главная (Trend Radar)
  /factory/page.tsx      — Content Factory (заглушка)
  /funnel/page.tsx       — Funnel Builder (заглушка)
  /analytics/page.tsx    — Analytics (заглушка)
  /settings/page.tsx     — Settings (API keys)
  /api
    /trends/route.ts     — API для получения трендов
    /analyze/route.ts    — API для AI анализа
    /usage/route.ts      — API для tracking расходов
/components
  /layout/Sidebar.tsx    — боковая навигация
  /layout/CostWidget.tsx — счётчик расходов
  /trends/TrendCard.tsx  — карточка тренда
  /trends/TrendList.tsx  — список трендов
  /trends/SourceFilter.tsx — фильтры
  /trends/VelocityChart.tsx — график скорости трендов
/lib
  /db.ts                 — SQLite инициализация
  /sources/reddit.ts     — Reddit API
  /sources/hackernews.ts — HN API
  /sources/youtube.ts    — YouTube API
  /sources/producthunt.ts — PH API
  /ai/anthropic.ts       — Claude API wrapper
  /ai/perplexity.ts      — Sonar API wrapper
  /ai/usage-tracker.ts   — трекинг расходов
  /scoring.ts            — система оценки трендов
/types
  /index.ts              — TypeScript типы
```

### Шаг 2 — Реализация источников данных

```
Реализуй загрузку трендов из всех источников.

Reddit: GET https://www.reddit.com/r/{subreddit}/hot.json?limit=25
Используй User-Agent header. Загружай из списка сабреддитов:
['artificial', 'ChatGPT', 'ClaudeAI', 'LocalLLaMA', 'SideProject', 'passive_income', 'cryptocurrency']

Hacker News: GET https://hacker-news.firebaseio.com/v0/topstories.json
Затем для каждого ID: GET https://hacker-news.firebaseio.com/v0/item/{id}.json
Загружай top 30.

YouTube: GET https://www.googleapis.com/youtube/v3/search
С параметрами: q=AI+tools|crypto|vibe+coding, type=video, order=viewCount,
publishedAfter=24h ago, maxResults=20, key=YOUTUBE_API_KEY

Все результаты нормализуй в единый формат:
{
  id: string,
  source: 'reddit' | 'hackernews' | 'youtube' | 'producthunt',
  title: string,
  url: string,
  score: number,
  comments: number,
  timestamp: number,
  author: string,
  subreddit?: string,
  extra?: any
}
```

### Шаг 3 — AI Scoring

```
Создай API route /api/analyze который:
1. Принимает массив трендов
2. Отправляет в Perplexity Sonar API с промптом:

"You are a content strategist for a faceless YouTube/TikTok channel in the AI + Money + Vibe Coding niche. Analyze these trending topics and for each return a JSON score:
- virality (0-100): likelihood of going viral based on engagement velocity
- niche_fit (0-100): relevance to AI, making money with AI, vibe coding, crypto
- content_potential (0-100): how easy to create engaging content from this
- suggested_format: 'slideshow' | 'screencast' | 'ai_video' | 'text_overlay' | 'timelapse'
- hook_idea: one sentence hook for short-form video
Return ONLY valid JSON array."

3. Логирует токены и стоимость в SQLite
4. Возвращает scored тренды
```

### Шаг 4 — UI Trend Radar

```
Создай главную страницу с:

1. Sidebar (левая панель):
   - Навигация: Radar, Factory, Funnel, Analytics, Settings
   - Фильтры по нише: AI, Money, Crypto, Vibe Coding (чекбоксы)
   - Фильтры по источнику: Reddit, HN, YouTube, PH (чекбоксы)
   - Фильтр по времени: 1h, 6h, 24h, 7d

2. Main area:
   - Заголовок "Trending Now" с кнопкой Refresh
   - Список TrendCard отсортированных по combined score
   - Каждая карточка: source icon, title, score, comments, время,
     virality/niche/content badges, actions (To Factory, View, Save)

3. CostWidget (правый верхний угол):
   - Расход сегодня/неделя/месяц в USD
   - Breakdown по моделям
   - Progress bar до месячного бюджета

4. Velocity Chart (внизу):
   - Recharts BarChart показывающий top trending keywords
   - Процент роста за 24h

Дизайн: тёмная тема, стиль как у Bloomberg Terminal.
Цвета: bg #0a0a0f, surface #12121a, green #00e68a, red #ff4d6a, blue #4d8aff
Шрифты: JetBrains Mono для цифр, Outfit для текста
```

### Шаг 5 — Settings Page

```
Страница настроек:
- Поля ввода для API ключей (сохраняются в .env.local или SQLite)
- Список отслеживаемых сабреддитов (добавление/удаление)
- Интервал обновления (15m, 30m, 1h)
- Месячный бюджет на AI ($)
- Тест подключения к каждому API (кнопка "Test Connection")
```

---

## Важные заметки для Claude Code

1. **Не используй localStorage** для API ключей — храни в .env.local или SQLite
2. **Все API вызовы к внешним сервисам** делай через API routes (server-side), не из клиента
3. **Rate limiting:** Reddit 60 req/min, HN без лимита, YouTube 10k/day
4. **Error handling:** если API недоступен — показывай cached данные из SQLite
5. **Кеширование:** сохраняй результаты в SQLite, показывай кеш пока идёт новый fetch
6. **Responsive:** должно работать на мониторе 1920x1080 и на ноутбуке

---

## Порядок разработки

1. ✅ Инициализация проекта (Next.js + deps)
2. ✅ SQLite setup + схема базы
3. ✅ Reddit API source
4. ✅ Hacker News API source
5. ✅ YouTube API source
6. ✅ Unified trend normalizer
7. ✅ AI scoring через Sonar API
8. ✅ Cost tracking system
9. ✅ UI: Sidebar + Layout
10. ✅ UI: TrendCard component
11. ✅ UI: TrendList with filters
12. ✅ UI: CostWidget
13. ✅ UI: VelocityChart
14. ✅ Settings page
15. ✅ Auto-refresh mechanism
16. 🔜 Phase 2: Content Factory
17. 🔜 Phase 3: Funnel Builder
18. 🔜 Phase 4: Analytics + OpenClaw integration
