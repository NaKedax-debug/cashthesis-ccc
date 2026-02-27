import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { AffiliateLink } from '@/types';

// GET — list all affiliate links, optionally filter by niche
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    const db = getDb();

    let rows;
    if (niche) {
      rows = db.prepare('SELECT * FROM affiliate_links WHERE niche = ? ORDER BY name').all(niche);
    } else {
      rows = db.prepare('SELECT * FROM affiliate_links ORDER BY name').all();
    }

    return NextResponse.json({ affiliates: rows as AffiliateLink[] });
  } catch (err) {
    console.error('Affiliates GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch affiliates' }, { status: 500 });
  }
}

// POST — create a new affiliate link
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AffiliateLink>;

    if (!body.name || !body.niche) {
      return NextResponse.json({ error: 'name and niche required' }, { status: 400 });
    }

    const id = `aff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const db = getDb();

    db.prepare(`
      INSERT INTO affiliate_links (id, name, niche, commission, signup_url, tracking_url, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.name,
      body.niche,
      body.commission ?? '',
      body.signup_url ?? '',
      body.tracking_url ?? '',
      body.notes ?? null
    );

    const affiliate: AffiliateLink = {
      id,
      name: body.name,
      niche: body.niche as AffiliateLink['niche'],
      commission: body.commission ?? '',
      signup_url: body.signup_url ?? '',
      tracking_url: body.tracking_url ?? '',
      notes: body.notes,
    };

    return NextResponse.json({ affiliate });
  } catch (err) {
    console.error('Affiliates POST error:', err);
    return NextResponse.json({ error: 'Failed to create affiliate' }, { status: 500 });
  }
}

// PATCH — update an affiliate link
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Partial<AffiliateLink> & { id: string };

    if (!body.id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM affiliate_links WHERE id = ?').get(body.id);
    if (!existing) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    for (const key of ['name', 'niche', 'commission', 'signup_url', 'tracking_url', 'notes'] as const) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    if (fields.length > 0) {
      values.push(body.id);
      db.prepare(`UPDATE affiliate_links SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM affiliate_links WHERE id = ?').get(body.id);
    return NextResponse.json({ affiliate: updated });
  } catch (err) {
    console.error('Affiliates PATCH error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// DELETE — remove an affiliate link
export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as { id: string };

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM affiliate_links WHERE id = ?').run(id);

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error('Affiliates DELETE error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
