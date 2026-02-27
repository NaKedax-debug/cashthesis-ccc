import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig, interpolate, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { whoosh as whooshSfx } from "@remotion/sfx";
import { Scene1Hook } from "./Scene1Hook";
import { Scene2WhatIs } from "./Scene2WhatIs";
import { Scene3Speed } from "./Scene3Speed";
import { Scene4SideHustle } from "./Scene4SideHustle";
import { Scene5Setup } from "./Scene5Setup";
import { Scene6CTA } from "./Scene6CTA";
import { BackgroundMusic } from "../BackgroundMusic";
import { COLORS, SCENE_FRAMES, SCENE_START, interFont } from "./constants";

/**
 * Qwen3.5 35B-A3B Benchmark — Screencast Explainer
 *
 * 6 scenes, 60s total (1440 frames at 24fps), 1920x1080 landscape
 *
 * Audio layers:
 * - Background music: dark electronic, volume 0.15, fade-in 1s, fade-out 2s
 * - SFX: whoosh on each scene transition
 * - Voiceover: per-scene MP3s in public/audio/ (generate via /api/voiceover)
 *
 * Voiceover scripts:
 * 1. "Stop waiting for cloud APIs to bankrupt your side hustle. Qwen3.5 35B
 *     is here, and you can run it on a single 16GB GPU. At 45 tokens per
 *     second. Let's see how."
 * 2. "Here's the secret: Qwen3.5 35B uses a hybrid architecture. 35 billion
 *     parameters total, but only 3 billion active at any time. Using sparse
 *     mixture-of-experts. Translation: massive intelligence without massive
 *     VRAM. It supports 262,000 tokens of context natively. And outperforms
 *     models six times its size."
 * 3. "On Alibaba's API, this model hits 166 tokens per second. But here's
 *     what matters: 45 tokens per second locally on a single 16GB RTX 5060.
 *     Fast enough for real-time apps. And with 262,000 tokens of context,
 *     you're processing entire codebases in one shot. Multimodal."
 * 4. "Think about your AI side hustle costs. Cloud APIs? Five hundred, a
 *     thousand dollars per month. With Qwen3.5 local, you break even in 3
 *     to 5 months. After that? Pure savings. Six grand a year."
 * 5. "Setup is simple. Download Ollama. Pull the quantized Qwen3.5 35B
 *     model. The hybrid architecture fits into 16GB VRAM. Launch the local
 *     server. You're running a 35-billion-parameter multimodal AI at 45
 *     tokens per second. No API keys. No rate limits. No monthly bills."
 * 6. "This is the moment. High-intelligence, multimodal AI. Local. Fast.
 *     Free. Subscribe for the next benchmark. Let's build AI together."
 */

const VOICEOVER_FILES = [
  "audio/qwen-vo-scene1.mp3",
  "audio/qwen-vo-scene2.mp3",
  "audio/qwen-vo-scene3.mp3",
  "audio/qwen-vo-scene4.mp3",
  "audio/qwen-vo-scene5.mp3",
  "audio/qwen-vo-scene6.mp3",
];

const TRANSITION_DURATION = 8; // frames (~0.33s at 24fps)

export const QwenBenchmark: React.FC = () => {
  const { fps } = useVideoConfig();

  const s = SCENE_START;
  const d = SCENE_FRAMES;

  const transitionPoints = [s.whatIs, s.speed, s.sideHustle, s.setup, s.cta];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* ==================== AUDIO ==================== */}

      {/* Background music */}
      <BackgroundMusic
        remoteSrc="https://remotion.media/whoosh.wav"
        volume={0.15}
        fadeInSec={1}
        fadeOutSec={2}
      />

      {/* Voiceover per scene — delayed 0.5s into each scene */}
      {Object.values(SCENE_START).map((start, i) => (
        <Sequence
          key={`vo-${i}`}
          from={start + Math.floor(fps * 0.5)}
          durationInFrames={Object.values(SCENE_FRAMES)[i] - Math.floor(fps * 0.5)}
          premountFor={fps}
        >
          <SceneVoiceover file={VOICEOVER_FILES[i]} />
        </Sequence>
      ))}

      {/* Transition SFX — whoosh between scenes */}
      {transitionPoints.map((at, i) => (
        <Sequence
          key={`sfx-${i}`}
          from={at - TRANSITION_DURATION}
          durationInFrames={TRANSITION_DURATION * 4}
          premountFor={Math.floor(fps * 0.3)}
        >
          <Audio src={whooshSfx} volume={0.4} />
        </Sequence>
      ))}

      {/* ==================== VISUALS ==================== */}

      {/* Scene 1: The Hook (0-8s) */}
      <Sequence from={s.hook} durationInFrames={d.hook} premountFor={fps}>
        <Scene1Hook />
      </Sequence>

      {/* Fade transition 1→2 */}
      <Sequence
        from={s.whatIs - TRANSITION_DURATION}
        durationInFrames={TRANSITION_DURATION}
        premountFor={Math.floor(fps * 0.3)}
      >
        <FadeTransition />
      </Sequence>

      {/* Scene 2: What Is Qwen3.5? (8-18s) */}
      <Sequence from={s.whatIs} durationInFrames={d.whatIs} premountFor={fps}>
        <Scene2WhatIs />
      </Sequence>

      {/* Fade transition 2→3 */}
      <Sequence
        from={s.speed - TRANSITION_DURATION}
        durationInFrames={TRANSITION_DURATION}
        premountFor={Math.floor(fps * 0.3)}
      >
        <FadeTransition />
      </Sequence>

      {/* Scene 3: The Speed Benchmark (18-30s) */}
      <Sequence from={s.speed} durationInFrames={d.speed} premountFor={fps}>
        <Scene3Speed />
      </Sequence>

      {/* Fade transition 3→4 */}
      <Sequence
        from={s.sideHustle - TRANSITION_DURATION}
        durationInFrames={TRANSITION_DURATION}
        premountFor={Math.floor(fps * 0.3)}
      >
        <FadeTransition />
      </Sequence>

      {/* Scene 4: Why This Matters (30-42s) */}
      <Sequence from={s.sideHustle} durationInFrames={d.sideHustle} premountFor={fps}>
        <Scene4SideHustle />
      </Sequence>

      {/* Fade transition 4→5 */}
      <Sequence
        from={s.setup - TRANSITION_DURATION}
        durationInFrames={TRANSITION_DURATION}
        premountFor={Math.floor(fps * 0.3)}
      >
        <FadeTransition />
      </Sequence>

      {/* Scene 5: The Technical Setup (42-54s) */}
      <Sequence from={s.setup} durationInFrames={d.setup} premountFor={fps}>
        <Scene5Setup />
      </Sequence>

      {/* Fade transition 5→6 */}
      <Sequence
        from={s.cta - TRANSITION_DURATION}
        durationInFrames={TRANSITION_DURATION}
        premountFor={Math.floor(fps * 0.3)}
      >
        <FadeTransition />
      </Sequence>

      {/* Scene 6: CTA + Branding (54-60s) */}
      <Sequence from={s.cta} durationInFrames={d.cta} premountFor={fps}>
        <Scene6CTA />
      </Sequence>

      {/* Watermark — visible from scene 2 onward */}
      <Sequence from={s.whatIs} premountFor={fps}>
        <Watermark />
      </Sequence>
    </AbsoluteFill>
  );
};

// --- Voiceover helper (graceful when files don't exist yet) ---

import { staticFile } from "remotion";

const SceneVoiceover: React.FC<{ file: string }> = ({ file }) => {
  try {
    const src = staticFile(file);
    return <Audio src={src} volume={0.9} />;
  } catch {
    return null;
  }
};

// --- Fade transition ---

const FadeTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [0, 0.7, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, opacity }} />
  );
};

// --- Watermark ---

const Watermark: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 28,
      right: 36,
      fontFamily: interFont,
      fontSize: 18,
      fontWeight: 600,
      color: COLORS.green,
      opacity: 0.7,
      letterSpacing: 1,
    }}
  >
    CashThesis
  </div>
);
