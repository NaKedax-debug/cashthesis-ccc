import type { TrendItem } from '@/types';
import { callSonar } from '@/lib/ai/perplexity';

const POLYMARKET_PROMPT = `Search Polymarket.com and find the current most popular and highest-volume prediction markets. Polymarket is a prediction market platform where users trade on real-world event outcomes.

List the top 15 active markets from Polymarket. Include markets about crypto prices, AI developments, tech companies, elections, geopolitics, and finance.

For each market, estimate the following based on publicly available information about Polymarket:
- title: the market question (e.g. "Will Bitcoin reach $150K by end of 2025?")
- volume_usd: estimated total trading volume in USD as a number
- traders: estimated number of traders as a number
- probability: the current leading outcome probability 0-100
- trending_direction: "up" or "down"
- category: "crypto" | "ai" | "tech" | "finance" | "politics" | "other"

You MUST respond with ONLY a JSON array. No text before or after. No markdown code blocks.
[{"title":"Will Bitcoin hit $200K in 2025?","volume_usd":5000000,"traders":8500,"probability":28,"trending_direction":"up","category":"crypto"},{"title":"Will GPT-5 be released before July 2025?","volume_usd":2000000,"traders":3200,"probability":65,"trending_direction":"up","category":"ai"}]`;

interface SonarMarket {
  title: string;
  volume_usd: number;
  traders: number;
  probability: number;
  trending_direction?: string;
  category?: string;
}

export async function fetchPolymarketTrends(): Promise<TrendItem[]> {
  try {
    const result = await callSonar(POLYMARKET_PROMPT, {
      endpoint: 'polymarket-trends',
    });

    // Parse response
    let markets: SonarMarket[];
    try {
      const cleaned = result.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      markets = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse Polymarket trends from Sonar:', result.text.slice(0, 200));
      return [];
    }

    if (!Array.isArray(markets)) {
      console.error('Sonar returned non-array for Polymarket trends');
      return [];
    }

    const now = Math.floor(Date.now() / 1000);

    return markets
      .filter((m) => m.title && typeof m.title === 'string')
      .map((m, i) => {
        const slug = m.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .slice(0, 60);
        const url = `https://polymarket.com/event/${slug}`;

        const volume = typeof m.volume_usd === 'number' ? m.volume_usd : 0;
        const traders = typeof m.traders === 'number' ? m.traders : 0;
        const probability = typeof m.probability === 'number' ? m.probability : 50;
        const direction = m.trending_direction === 'down' ? 'down' : 'up';
        const category = m.category || 'other';

        return {
          id: `polymarket-${now}-${i}`,
          source: 'polymarket' as const,
          title: m.title,
          url,
          score: Math.round(volume / 1000), // normalize: $1M → 1000
          comments: traders,
          timestamp: now - i * 120,
          author: 'Polymarket',
          extra: {
            volume_usd: volume,
            traders,
            probability,
            trending_direction: direction,
            category,
          },
        };
      });
  } catch (err) {
    console.error('Polymarket trends fetch error:', err);
    return [];
  }
}
