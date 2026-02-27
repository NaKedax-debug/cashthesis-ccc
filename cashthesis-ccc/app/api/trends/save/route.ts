import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { trend_id, saved } = (await request.json()) as {
      trend_id: string;
      saved: boolean;
    };

    if (!trend_id) {
      return NextResponse.json({ error: 'trend_id required' }, { status: 400 });
    }

    const db = getDb();

    if (saved) {
      db.prepare('INSERT OR IGNORE INTO saved_trends (trend_id) VALUES (?)').run(trend_id);
    } else {
      db.prepare('DELETE FROM saved_trends WHERE trend_id = ?').run(trend_id);
    }

    return NextResponse.json({ ok: true, trend_id, saved });
  } catch (err) {
    console.error('Save API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Save failed' },
      { status: 500 }
    );
  }
}
