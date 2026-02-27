import type { TrendItem } from '@/types';

const SUBREDDITS = [
  'artificial',
  'ChatGPT',
  'ClaudeAI',
  'LocalLLaMA',
  'SideProject',
  'passive_income',
  'entrepreneur',
  'vibecoding',
  'webdev',
  'cryptocurrency',
];

const USER_AGENT = 'CashThesis-CCC/1.0';

interface RedditPost {
  data: {
    id: string;
    title: string;
    score: number;
    num_comments: number;
    created_utc: number;
    url: string;
    permalink: string;
    author: string;
    subreddit: string;
    selftext: string;
    link_flair_text?: string;
  };
}

async function fetchSubreddit(subreddit: string, limit = 25): Promise<TrendItem[]> {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
      {
        headers: { 'User-Agent': USER_AGENT },
        next: { revalidate: 900 }, // 15min cache
      }
    );

    if (!res.ok) {
      console.error(`Reddit r/${subreddit}: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const posts: RedditPost[] = data?.data?.children ?? [];

    return posts
      .filter((p) => !p.data.selftext?.includes('[removed]'))
      .map((p) => ({
        id: `reddit-${p.data.id}`,
        source: 'reddit' as const,
        title: p.data.title,
        url: `https://reddit.com${p.data.permalink}`,
        score: p.data.score,
        comments: p.data.num_comments,
        timestamp: p.data.created_utc,
        author: p.data.author,
        subreddit: p.data.subreddit,
        extra: {
          flair: p.data.link_flair_text,
          externalUrl: p.data.url,
        },
      }));
  } catch (err) {
    console.error(`Reddit r/${subreddit} error:`, err);
    return [];
  }
}

export async function fetchRedditTrends(subreddits?: string[]): Promise<TrendItem[]> {
  const subs = subreddits ?? SUBREDDITS;
  const results = await Promise.allSettled(subs.map((s) => fetchSubreddit(s)));

  return results
    .filter((r): r is PromiseFulfilledResult<TrendItem[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);
}

export { SUBREDDITS };
