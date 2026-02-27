import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Funnel, FunnelStep } from '@/types';

interface FunnelRow {
  id: string;
  name: string;
  content_plan_id: string | null;
  steps: string;
  created_at: string;
  updated_at: string;
}

function rowToFunnel(row: FunnelRow): Funnel {
  return {
    id: row.id,
    name: row.name,
    content_plan_id: row.content_plan_id ?? undefined,
    steps: JSON.parse(row.steps) as FunnelStep[],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// GET — list all funnels or get a specific one
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const funnelId = searchParams.get('id');
    const db = getDb();

    if (funnelId) {
      const row = db.prepare('SELECT * FROM funnels WHERE id = ?').get(funnelId) as FunnelRow | undefined;
      if (!row) {
        return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
      }
      return NextResponse.json({ funnel: rowToFunnel(row) });
    }

    const rows = db.prepare('SELECT * FROM funnels ORDER BY updated_at DESC').all() as FunnelRow[];
    return NextResponse.json({ funnels: rows.map(rowToFunnel) });
  } catch (err) {
    console.error('Funnels GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch funnels' }, { status: 500 });
  }
}

// POST — create a new funnel
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name: string; content_plan_id?: string; steps?: FunnelStep[] };

    if (!body.name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    const id = `funnel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const steps = body.steps ?? getDefaultSteps();
    const db = getDb();

    db.prepare(`
      INSERT INTO funnels (id, name, content_plan_id, steps, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, body.name, body.content_plan_id ?? null, JSON.stringify(steps), now, now);

    const funnel: Funnel = {
      id,
      name: body.name,
      content_plan_id: body.content_plan_id,
      steps,
      created_at: now,
      updated_at: now,
    };

    return NextResponse.json({ funnel });
  } catch (err) {
    console.error('Funnels POST error:', err);
    return NextResponse.json({ error: 'Failed to create funnel' }, { status: 500 });
  }
}

// PATCH — update funnel name or steps
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id: string; name?: string; steps?: FunnelStep[] };

    if (!body.id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM funnels WHERE id = ?').get(body.id) as FunnelRow | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: unknown[] = [now];

    if (body.name !== undefined) {
      fields.push('name = ?');
      values.push(body.name);
    }
    if (body.steps !== undefined) {
      fields.push('steps = ?');
      values.push(JSON.stringify(body.steps));
    }

    values.push(body.id);
    db.prepare(`UPDATE funnels SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM funnels WHERE id = ?').get(body.id) as FunnelRow;
    return NextResponse.json({ funnel: rowToFunnel(updated) });
  } catch (err) {
    console.error('Funnels PATCH error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// DELETE — remove a funnel
export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as { id: string };

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM funnels WHERE id = ?').run(id);

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error('Funnels DELETE error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

function getDefaultSteps(): FunnelStep[] {
  return [
    {
      id: `step-${Date.now()}-1`,
      type: 'content',
      label: 'Short-form Video',
      children: [
        {
          id: `step-${Date.now()}-2`,
          type: 'cta',
          label: 'CTA: Link in Bio',
          children: [
            {
              id: `step-${Date.now()}-3`,
              type: 'landing',
              label: 'Landing Page',
              children: [
                {
                  id: `step-${Date.now()}-4`,
                  type: 'affiliate',
                  label: 'Affiliate Link',
                  children: [],
                },
                {
                  id: `step-${Date.now()}-5`,
                  type: 'lead_magnet',
                  label: 'Free Guide Download',
                  children: [
                    {
                      id: `step-${Date.now()}-6`,
                      type: 'email_list',
                      label: 'Email List',
                      children: [
                        {
                          id: `step-${Date.now()}-7`,
                          type: 'upsell',
                          label: 'Premium Course Upsell',
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}
