import type { TrendItem } from '@/types';

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  descendants: number;
  time: number;
  by: string;
  type: string;
}

async function fetchItem(id: number): Promise<HNItem | null> {
  try {
    const res = await fetch(`${HN_BASE}/item/${id}.json`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchHackerNewsTrends(limit = 30): Promise<TrendItem[]> {
  try {
    const res = await fetch(`${HN_BASE}/topstories.json`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];

    const ids: number[] = await res.json();
    const topIds = ids.slice(0, limit);

    const items = await Promise.allSettled(topIds.map(fetchItem));

    return items
      .filter(
        (r): r is PromiseFulfilledResult<HNItem> =>
          r.status === 'fulfilled' && r.value !== null && r.value.type === 'story'
      )
      .map((r) => r.value)
      .map((item) => ({
        id: `hn-${item.id}`,
        source: 'hackernews' as const,
        title: item.title,
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        score: item.score,
        comments: item.descendants ?? 0,
        timestamp: item.time,
        author: item.by,
      }));
  } catch (err) {
    console.error('HN fetch error:', err);
    return [];
  }
}
