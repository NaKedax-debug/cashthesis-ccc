import { NextResponse } from 'next/server';
import { generateVoiceover, generateSceneVoiceovers } from '@/lib/elevenlabs';
import type { TTSOptions } from '@/lib/elevenlabs';

type VoiceStyle = TTSOptions['voiceStyle'];

interface SingleRequest {
  text: string;
  voiceId?: string;
  voiceStyle?: VoiceStyle;
  model?: string;
}

interface ScenesRequest {
  scenes: Array<{ text: string; voiceStyle?: VoiceStyle }>;
  voiceId?: string;
  model?: string;
}

/**
 * POST /api/tts
 *
 * Single text mode:
 *   { text: "...", voiceStyle?: "urgent"|"calm"|"excited"|"dramatic", voiceId?, model? }
 *   → { audio: base64, characterCount, costUsd }
 *
 * Batch scenes mode:
 *   { scenes: [{ text: "...", voiceStyle?: "..." }, ...], voiceId?, model? }
 *   → { scenes: [{ audio: base64, characterCount, costUsd }, ...], totalCost }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Batch scenes mode
    if (Array.isArray(body.scenes)) {
      const { scenes, voiceId, model } = body as ScenesRequest;

      if (scenes.length === 0) {
        return NextResponse.json({ error: 'scenes array is empty' }, { status: 400 });
      }
      if (scenes.length > 20) {
        return NextResponse.json({ error: 'Maximum 20 scenes per request' }, { status: 400 });
      }

      for (let i = 0; i < scenes.length; i++) {
        if (!scenes[i].text || scenes[i].text.trim().length === 0) {
          return NextResponse.json({ error: `Scene ${i} has empty text` }, { status: 400 });
        }
        if (scenes[i].text.length > 5000) {
          return NextResponse.json(
            { error: `Scene ${i} exceeds 5000 character limit` },
            { status: 400 }
          );
        }
      }

      const results = await generateSceneVoiceovers(scenes, { voiceId, model });

      let totalCost = 0;
      const sceneResults = results.map((r) => {
        totalCost += r.costUsd;
        return {
          audio: r.audioBuffer.length > 0 ? r.audioBuffer.toString('base64') : null,
          characterCount: r.characterCount,
          costUsd: r.costUsd,
        };
      });

      return NextResponse.json({ scenes: sceneResults, totalCost });
    }

    // Single text mode
    const { text, voiceId, voiceStyle, model } = body as SingleRequest;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters per request.' },
        { status: 400 }
      );
    }

    const result = await generateVoiceover(text, { voiceId, voiceStyle, model });

    return NextResponse.json({
      audio: result.audioBuffer.toString('base64'),
      characterCount: result.characterCount,
      costUsd: result.costUsd,
    });
  } catch (err) {
    console.error('TTS generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'TTS generation failed' },
      { status: 500 }
    );
  }
}
