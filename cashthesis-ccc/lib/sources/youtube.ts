import type { TrendItem } from '@/types';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const SEARCH_QUERIES = ['AI tools', 'crypto trading bot', 'vibe coding', 'make money with AI'];

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    description: string;
  };
}

export async function fetchYouTubeTrends(limit = 20): Promise<TrendItem[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn('YouTube API key not configured');
    return [];
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  try {
    const query = SEARCH_QUERIES.join('|');
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      order: 'viewCount',
      publishedAfter: oneDayAgo,
      maxResults: String(limit),
      key: apiKey,
    });

    const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      console.error(`YouTube API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const items: YouTubeSearchItem[] = data.items ?? [];

    return items.map((item) => ({
      id: `yt-${item.id.videoId}`,
      source: 'youtube' as const,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      score: 0, // YouTube search doesn't return view counts directly
      comments: 0,
      timestamp: Math.floor(new Date(item.snippet.publishedAt).getTime() / 1000),
      author: item.snippet.channelTitle,
      extra: {
        description: item.snippet.description,
      },
    }));
  } catch (err) {
    console.error('YouTube fetch error:', err);
    return [];
  }
}
