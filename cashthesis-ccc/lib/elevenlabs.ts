import fs from 'fs';
import path from 'path';
import { trackUsage } from './ai/usage-tracker';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

function getEnvFromFile(key: string): string | undefined {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

// Voice style presets matching the styles from remotion-prompt-generator
const VOICE_STYLES: Record<string, { stability: number; similarity_boost: number; style: number; speed: number }> = {
  urgent:   { stability: 0.3, similarity_boost: 0.8, style: 0.7, speed: 1.15 },
  calm:     { stability: 0.8, similarity_boost: 0.7, style: 0.3, speed: 0.95 },
  excited:  { stability: 0.35, similarity_boost: 0.85, style: 0.8, speed: 1.1 },
  dramatic: { stability: 0.5, similarity_boost: 0.9, style: 0.6, speed: 0.9 },
};

// Default multilingual voice — swap voice_id to change speaker
const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam

export interface TTSOptions {
  voiceId?: string;
  voiceStyle?: 'urgent' | 'calm' | 'excited' | 'dramatic';
  model?: string;
  outputFormat?: 'mp3_44100_128' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000';
}

export interface TTSResult {
  audioBuffer: Buffer;
  characterCount: number;
  costUsd: number;
}

/**
 * Strip [PAUSE], [SFX: ...] markers from voiceover text.
 * Converts [PAUSE 0.5s] to "..." so TTS inserts a natural breath.
 */
function cleanVoiceoverText(raw: string): string {
  return raw
    .replace(/\[PAUSE\s*[\d.]*s?\]/gi, '...')
    .replace(/\[SFX:\s*[^\]]+\]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Generate TTS audio from voiceover text via ElevenLabs API.
 * Returns raw audio buffer (mp3 by default).
 */
export async function generateVoiceover(
  text: string,
  options?: TTSOptions
): Promise<TTSResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY || getEnvFromFile('ELEVENLABS_API_KEY');
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');

  const voiceId = options?.voiceId ?? DEFAULT_VOICE_ID;
  const model = options?.model ?? 'eleven_multilingual_v2';
  const outputFormat = options?.outputFormat ?? 'mp3_44100_128';
  const style = VOICE_STYLES[options?.voiceStyle ?? 'calm'];

  const cleanedText = cleanVoiceoverText(text);

  const res = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}?output_format=${outputFormat}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: cleanedText,
        model_id: model,
        voice_settings: {
          stability: style.stability,
          similarity_boost: style.similarity_boost,
          style: style.style,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs API error ${res.status}: ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);
  const characterCount = cleanedText.length;
  const costUsd = calculateElevenLabsCost(model, characterCount);

  await trackUsage({
    provider: 'elevenlabs',
    model,
    input_tokens: characterCount,
    output_tokens: 0,
    cost_usd: costUsd,
    endpoint: 'tts-voiceover',
  });

  return { audioBuffer, characterCount, costUsd };
}

/**
 * Generate voiceover for multiple scenes and return individual audio buffers.
 */
export async function generateSceneVoiceovers(
  scenes: Array<{ text: string; voiceStyle?: TTSOptions['voiceStyle'] }>,
  options?: Omit<TTSOptions, 'voiceStyle'>
): Promise<TTSResult[]> {
  const results = await Promise.allSettled(
    scenes.map((scene) =>
      generateVoiceover(scene.text, { ...options, voiceStyle: scene.voiceStyle })
    )
  );

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    console.error(`Scene ${i} TTS failed:`, r.reason);
    return { audioBuffer: Buffer.alloc(0), characterCount: 0, costUsd: 0 };
  });
}

// ElevenLabs pricing per character (multilingual v2: $0.30 / 1000 chars)
function calculateElevenLabsCost(model: string, characters: number): number {
  const pricing: Record<string, number> = {
    'eleven_multilingual_v2': 0.30,
    'eleven_monolingual_v1': 0.30,
    'eleven_turbo_v2': 0.15,
    'eleven_turbo_v2_5': 0.15,
  };
  const perThousand = pricing[model] ?? 0.30;
  return (characters / 1000) * perThousand;
}

export { cleanVoiceoverText };
