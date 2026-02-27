import fs from 'fs';
import path from 'path';
import { trackUsage } from './usage-tracker';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

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

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
}

export async function callClaude(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    system?: string;
    endpoint?: string;
    trendId?: number;
  }
): Promise<{ text: string; usage: { input_tokens: number; output_tokens: number } }> {
  const apiKey = process.env.ANTHROPIC_API_KEY || getEnvFromFile('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const model = options?.model ?? 'claude-3-haiku-20240307';

  const messages: AnthropicMessage[] = [{ role: 'user', content: prompt }];

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: options?.maxTokens ?? 2048,
      system: options?.system,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data: AnthropicResponse = await res.json();

  // Track usage
  await trackUsage({
    provider: 'anthropic',
    model,
    input_tokens: data.usage.input_tokens,
    output_tokens: data.usage.output_tokens,
    cost_usd: calculateAnthropicCost(model, data.usage.input_tokens, data.usage.output_tokens),
    endpoint: options?.endpoint ?? 'claude-generic',
    trend_id: options?.trendId,
  });

  return {
    text: data.content[0]?.text ?? '',
    usage: data.usage,
  };
}

function calculateAnthropicCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  };

  // Fallback pricing
  const price = pricing[model] ?? { input: 3.0, output: 15.0 };
  return (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;
}
