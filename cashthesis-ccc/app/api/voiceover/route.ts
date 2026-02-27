import { NextResponse } from 'next/server';
import { generateVoiceover } from '@/lib/ai/elevenlabs';

export async function POST(request: Request) {
  try {
    const { text, voiceId, filename } = (await request.json()) as {
      text: string;
      voiceId?: string;
      filename?: string;
    };

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters per request.' },
        { status: 400 }
      );
    }

    const result = await generateVoiceover(text, {
      voiceId,
      filename,
      endpoint: 'voiceover-api',
    });

    return NextResponse.json({
      filePath: result.relativePath,
      characterCount: result.characterCount,
      costUsd: result.costUsd,
    });
  } catch (err) {
    console.error('Voiceover generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
