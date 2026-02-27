import type { TrendItem } from '@/types';
import { callSonar } from '@/lib/ai/perplexity';

const TWITTER_PROMPT = `What are the top 20 most discussed and viral topics on Twitter/X right now about AI tools, crypto, making money online, and coding/vibe coding?

For each topic return a JSON object with:
- title: concise topic title (max 100 chars)
- engagement: estimated total engagement (likes + retweets + replies) as a number
- comments: estimated number of replies/quote tweets as a number
- key_accounts: 1-2 notable accounts discussing it
- url: a relevant tweet URL or "https://x.com/search?q=" + encoded search query

Return ONLY a valid JSON array. No markdown, no explanation.
Example format:
[
  {
    "title": "OpenAI launches new GPT-5 model",
    "engagement": 45000,
    "comments": 1200,
    "key_accounts": ["@sama", "@OpenAI"],
    "url": "https://x.com/OpenAI/status/123"
  }
]`;

interface SonarTweet {
  title: string;
  engagement: number;
  comments: number;
  key_accounts?: string[];
  url?: string;
}

export async function fetchTwitterTrends(): Promise<TrendItem[]> {
  try {
    const result = await callSonar(TWITTER_PROMPT, {
      endpoint: 'twitter-trends',
    });

    // Parse response
    let tweets: SonarTweet[];
    try {
      const cleaned = result.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      tweets = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse Twitter trends from Sonar:', result.text.slice(0, 200));
      return [];
    }

    if (!Array.isArray(tweets)) {
      console.error('Sonar returned non-array for Twitter trends');
      return [];
    }

    const now = Math.floor(Date.now() / 1000);

    return tweets
      .filter((t) => t.title && typeof t.title === 'string')
      .map((t, i) => {
        const accounts = t.key_accounts?.join(', ') ?? '';
        const searchQuery = encodeURIComponent(t.title.slice(0, 60));
        const url = t.url && t.url.startsWith('http')
          ? t.url
          : `https://x.com/search?q=${searchQuery}&f=live`;

        return {
          id: `twitter-${now}-${i}`,
          source: 'twitter' as const,
          title: t.title,
          url,
          score: typeof t.engagement === 'number' ? t.engagement : 0,
          comments: typeof t.comments === 'number' ? t.comments : 0,
          timestamp: now - i * 60, // stagger slightly for sorting
          author: accounts || 'Twitter/X',
          extra: {
            key_accounts: t.key_accounts,
          },
        };
      });
  } catch (err) {
    console.error('Twitter trends fetch error:', err);
    return [];
  }
}
