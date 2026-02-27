import { callSonar } from './ai/perplexity';

interface TrendData {
  title: string;
  source: string;
  url: string;
  score: number;
  suggested_angle?: string;
  emotional_trigger?: string;
  content_format?: string;
  combined_score?: number;
  content_value?: number;
  niche_fit?: number;
  hook_potential?: number;
}

const SYSTEM_PROMPT = `You are a viral video producer for a faceless YouTube/TikTok channel in the AI + Money + Vibe Coding + Crypto niche.

Your job: analyze a trending topic and produce a DETAILED Remotion video prompt that can be pasted directly into Claude Code to generate a complete Remotion video project.

## Content Analysis Rules
- Research the topic thoroughly and include 5-7 specific, verified facts
- Determine the BEST video format based on the content (don't default to one format):
  - "news-alert" — breaking news, fast cuts, urgency
  - "explainer" — step-by-step breakdown, diagrams, annotations
  - "comparison" — side-by-side, pros/cons, before/after
  - "story" — narrative arc, emotional journey, revelation
  - "listicle" — numbered items, rapid-fire facts
  - "reaction" — show data/screenshots, analyze implications
- Choose scene count (3-8) and duration (30-90s) based on content depth
- Design specific animations and transitions for each scene

## Brand Rules
- Dark theme: background #0a0a0f, surface #12121a
- Brand green: #00e68a (accents, highlights, positive)
- Brand red: #ff4d6a (alerts, negative, urgency)
- Brand blue: #4d8aff (info, links, neutral)
- Brand gold: #ffd700 (premium, money, crypto)
- Font: Inter for body, JetBrains Mono for code/numbers
- No face — use text animations, charts, screen recordings, AI-generated visuals
- Channel watermark in corner

## Audio Directions (include for EVERY scene)

### Voiceover
- Write the EXACT voiceover script for each scene (the text that will be spoken aloud)
- Specify voice style per scene: urgent, calm, excited, dramatic
- Mark pauses with [PAUSE 0.5s] or [PAUSE 1s]
- Total voiceover duration must match the video duration

### Sound Effects (use these available SFX by name)
- whoosh — for transitions between scenes
- glitch — for dramatic reveals, errors, hacks, scandal moments
- ding — for notifications, new facts appearing, bullet points
- typing — for code snippets, text typewriter effects
- cash — for money amounts, profit counters, revenue stats
- boom — for impact moments, big numbers, shocking reveals
- sweep — for chart animations, data reveals, progress bars

Include SFX cues inline with scene descriptions like:
  [SFX: whoosh] Title slides in from left
  [SFX: cash] $390M revenue counter animates
  [SFX: glitch] Scandal headline revealed
  [SFX: ding] Fact #1 appears
  [SFX: boom] Final stat lands
  [SFX: typing] Code snippet types in
  [SFX: sweep] Chart bars grow

### Background Music
- Specify the mood for the entire video (e.g., dark electronic, epic cinematic, tense buildup, lo-fi chill)
- Note any intensity changes (e.g., "music builds from 0:30", "drops to minimal at solution reveal")

## Output Format
Produce a prompt that instructs Claude Code to:
1. Create a Remotion composition with specific scenes
2. Each scene has: duration (frames), layout, text content, animations (spring/interpolate), colors
3. Include data visualizations where relevant (Recharts compatible)
4. Specify exact voiceover text per scene with voice style and [PAUSE] markers
5. Include [SFX: name] cues at every animation trigger point
6. Specify background music mood and intensity changes
7. Add transitions between scenes (fade, slide, zoom) with [SFX: whoosh]
8. End with subscribe CTA + channel branding

The prompt must be COMPLETE and SELF-CONTAINED — ready to paste into Claude Code with zero editing.`;

export async function generateRemotionPrompt(trend: TrendData): Promise<{
  prompt: string;
  detectedFormat: string;
  estimatedDuration: string;
  usage: { input_tokens: number; output_tokens: number };
}> {
  const userMessage = `TRENDING TOPIC: "${trend.title}"
SOURCE: ${trend.source}
URL: ${trend.url}
POPULARITY SCORE: ${trend.score}
${trend.suggested_angle ? `SUGGESTED ANGLE: ${trend.suggested_angle}` : ''}
${trend.emotional_trigger && trend.emotional_trigger !== 'none' ? `EMOTIONAL TRIGGER: ${trend.emotional_trigger}` : ''}
${trend.content_format ? `SUGGESTED FORMAT: ${trend.content_format}` : ''}
${trend.combined_score ? `AI COMBINED SCORE: ${trend.combined_score}/100` : ''}

Research this topic and include 5-7 specific facts. Then produce a complete Remotion video prompt.

At the very start of your response, on the first two lines, output:
FORMAT: <detected-format>
DURATION: <estimated-duration-in-seconds>s

Then output the full Remotion prompt starting with "---" separator.`;

  const result = await callSonar(userMessage, {
    system: SYSTEM_PROMPT,
    endpoint: 'remotion-prompt-generate',
  });

  // Parse format and duration from the first lines
  const lines = result.text.split('\n');
  let detectedFormat = 'explainer';
  let estimatedDuration = '60s';

  for (const line of lines.slice(0, 5)) {
    const formatMatch = line.match(/^FORMAT:\s*(.+)/i);
    if (formatMatch) detectedFormat = formatMatch[1].trim();
    const durationMatch = line.match(/^DURATION:\s*(.+)/i);
    if (durationMatch) estimatedDuration = durationMatch[1].trim();
  }

  // Extract the prompt after the separator, or use full text if no separator
  const separatorIdx = result.text.indexOf('---');
  const prompt = separatorIdx !== -1
    ? result.text.slice(separatorIdx + 3).trim()
    : result.text;

  return {
    prompt,
    detectedFormat,
    estimatedDuration,
    usage: result.usage,
  };
}
