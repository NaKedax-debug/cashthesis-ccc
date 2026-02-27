import fs from 'fs';
import path from 'path';
import { trackUsage } from './usage-tracker';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

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

interface PerplexityResponse {
  choices: Array<{
    message: { content: string };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
  model: string;
}

export async function callSonar(
  prompt: string,
  options?: {
    model?: string;
    system?: string;
    endpoint?: string;
    trendId?: number;
  }
): Promise<{ text: string; usage: { input_tokens: number; output_tokens: number } }> {
  const apiKey = process.env.PERPLEXITY_API_KEY || getEnvFromFile('PERPLEXITY_API_KEY');
  if (!apiKey) throw new Error('PERPLEXITY_API_KEY not configured');

  const model = options?.model ?? 'sonar';

  const messages: Array<{ role: string; content: string }> = [];
  if (options?.system) {
    messages.push({ role: 'system', content: options.system });
  }
  messages.push({ role: 'user', content: prompt });

  const res = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Perplexity API error ${res.status}: ${err}`);
  }

  const data: PerplexityResponse = await res.json();
  const inputTokens = data.usage.prompt_tokens;
  const outputTokens = data.usage.completion_tokens;

  await trackUsage({
    provider: 'perplexity',
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: calculatePerplexityCost(model, inputTokens, outputTokens),
    endpoint: options?.endpoint ?? 'sonar-generic',
    trend_id: options?.trendId,
  });

  return {
    text: data.choices[0]?.message?.content ?? '',
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
  };
}

function calculatePerplexityCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'sonar': { input: 1.0, output: 1.0 },
    'sonar-pro': { input: 3.0, output: 15.0 },
  };

  const price = pricing[model] ?? { input: 1.0, output: 1.0 };
  return (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;
}
