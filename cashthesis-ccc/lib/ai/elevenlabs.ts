import fs from 'fs';
import path from 'path';
import { trackUsage } from './usage-tracker';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// ElevenLabs pricing: ~$0.30 per 1K characters (Starter plan)
const COST_PER_1K_CHARS = 0.30;

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

export interface VoiceoverOptions {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  outputDir?: string;
  filename?: string;
  endpoint?: string;
}

export interface VoiceoverResult {
  filePath: string;
  relativePath: string;
  characterCount: number;
  costUsd: number;
}

/**
 * Generate voiceover audio using ElevenLabs TTS API.
 *
 * Default voice style: deep, urgent male.
 * Set ELEVENLABS_API_KEY in .env.local.
 * Configure voice ID when ready — use ElevenLabs voice library to find one.
 *
 * @param text - The text to synthesize
 * @param options - Voice settings and output configuration
 */
export async function generateVoiceover(
  text: string,
  options?: VoiceoverOptions
): Promise<VoiceoverResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY || getEnvFromFile('ELEVENLABS_API_KEY');
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');

  // Default: "Adam" — a deep, professional male voice
  // Replace with your preferred voice ID from ElevenLabs voice library
  const voiceId = options?.voiceId ?? 'pNInz6obpgDQGcFmaJgB';
  const modelId = options?.modelId ?? 'eleven_multilingual_v2';

  const res = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: options?.stability ?? 0.5,
        similarity_boost: options?.similarityBoost ?? 0.75,
        style: options?.style ?? 0.4,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs API error ${res.status}: ${err}`);
  }

  // Read audio as buffer
  const audioBuffer = Buffer.from(await res.arrayBuffer());

  // Output directory: default to cashthesis-videos/public/audio/
  const outputDir = options?.outputDir
    ?? path.join(process.cwd(), '..', 'cashthesis-videos', 'public', 'audio');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = options?.filename ?? `voiceover-${Date.now()}.mp3`;
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, audioBuffer);

  // Calculate cost
  const characterCount = text.length;
  const costUsd = (characterCount / 1000) * COST_PER_1K_CHARS;

  // Track usage
  await trackUsage({
    provider: 'elevenlabs',
    model: modelId,
    input_tokens: characterCount,
    output_tokens: 0,
    cost_usd: costUsd,
    endpoint: options?.endpoint ?? 'tts-voiceover',
  });

  return {
    filePath,
    relativePath: filename,
    characterCount,
    costUsd,
  };
}
