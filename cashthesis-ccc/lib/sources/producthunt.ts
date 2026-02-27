import type { TrendItem } from '@/types';
import { callSonar } from '@/lib/ai/perplexity';

const PH_PROMPT = `What are the top 15 most upvoted and discussed product launches on Product Hunt today and this week? Focus on products related to AI tools, developer tools, crypto/web3, productivity, and SaaS.

For each product return a JSON object with:
- name: product name (max 60 chars)
- tagline: one-line description (max 120 chars)
- votes: estimated number of upvotes as a number
- comments: estimated number of comments as a number
- maker: maker/founder name or company
- url: Product Hunt URL (https://www.producthunt.com/posts/product-slug) or best guess
- topics: array of 1-3 topic tags

Return ONLY a valid JSON array. No markdown, no explanation.
Example format:
[
  {
    "name": "Cursor AI",
    "tagline": "AI-first code editor that helps you build software faster",
    "votes": 1200,
    "comments": 85,
    "maker": "Cursor Team",
    "url": "https://www.producthunt.com/posts/cursor-ai",
    "topics": ["AI", "Developer Tools"]
  }
]`;

interface SonarProduct {
  name: string;
  tagline?: string;
  votes: number;
  comments: number;
  maker?: string;
  url?: string;
  topics?: string[];
}

export async function fetchProductHuntTrends(): Promise<TrendItem[]> {
  try {
    const result = await callSonar(PH_PROMPT, {
      endpoint: 'producthunt-trends',
    });

    // Parse response
    let products: SonarProduct[];
    try {
      const cleaned = result.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      products = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse Product Hunt trends from Sonar:', result.text.slice(0, 200));
      return [];
    }

    if (!Array.isArray(products)) {
      console.error('Sonar returned non-array for Product Hunt trends');
      return [];
    }

    const now = Math.floor(Date.now() / 1000);

    return products
      .filter((p) => p.name && typeof p.name === 'string')
      .map((p, i) => {
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const url = p.url && p.url.startsWith('http')
          ? p.url
          : `https://www.producthunt.com/posts/${slug}`;

        return {
          id: `ph-${now}-${i}`,
          source: 'producthunt' as const,
          title: p.tagline ? `${p.name} — ${p.tagline}` : p.name,
          url,
          score: typeof p.votes === 'number' ? p.votes : 0,
          comments: typeof p.comments === 'number' ? p.comments : 0,
          timestamp: now - i * 120, // stagger for sorting
          author: p.maker || 'Product Hunt',
          extra: {
            topics: p.topics ?? [],
          },
        };
      });
  } catch (err) {
    console.error('Product Hunt trends fetch error:', err);
    return [];
  }
}
