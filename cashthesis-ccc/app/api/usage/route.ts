import { NextResponse } from 'next/server';
import { getCostSummary } from '@/lib/ai/usage-tracker';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = getCostSummary();
    return NextResponse.json(summary);
  } catch (err) {
    console.error('Usage API error:', err);
    return NextResponse.json(
      { today: 0, week: 0, month: 0, by_model: {}, budget: 30 },
      { status: 500 }
    );
  }
}
