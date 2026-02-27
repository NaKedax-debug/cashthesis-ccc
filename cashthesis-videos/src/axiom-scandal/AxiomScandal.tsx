import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { whoosh as whooshSfx, uiSwitch as switchSfx } from "@remotion/sfx";
import { Scene1Hook } from "./Scene1Hook";
import { Scene2Crime } from "./Scene2Crime";
import { Scene3Scale } from "./Scene3Scale";
import { Scene4Flaw } from "./Scene4Flaw";
import { Scene5Solution } from "./Scene5Solution";
import { Scene6CTA } from "./Scene6CTA";
import { GlitchTransition } from "./GlitchTransition";
import { Watermark } from "./Watermark";
import { BackgroundMusic } from "../BackgroundMusic";
import { COLORS, SCENE_DURATION, TRANSITION_DURATION } from "./constants";

/**
 * Axiom Exchange Insider Trading Scandal — Explainer Video
 *
 * 6 scenes × 10s each = 60s total (3600 frames at 60fps)
 * Each scene: 600 frames
 * Transitions: 20-frame red glitch overlays between scenes
 *
 * Audio layers:
 * - Background music: looping, volume 0.15, fade-in 1s, fade-out 2s
 * - SFX: whoosh/glitch on each transition point
 * - Voiceover: per-scene MP3 files in public/audio/
 *
 * Voiceover cues per scene (generate with ElevenLabs via /api/voiceover):
 * 1. "Axiom Exchange insiders caught red-handed: abusing private wallet data
 *     for massive profits. ZachXBT just dropped the bomb."
 * 2. "Broox Bauer queried user wallets via internal tools for 1+ year.
 *     Leaked calls reveal $200K profit plans and shared screenshots."
 * 3. "Axiom: $390M revenue DEX, but zero controls. Insiders front-ran
 *     ZachXBT on Polymarket — $1M profits from leaked info."
 * 4. "Started small: 10-20 wallets to dodge flags. Proves crypto needs
 *     privacy from insiders — not just outsiders."
 * 5. "Enter programmable privacy protocols: Zero-knowledge tech hides your
 *     data — even from exchange employees. Axiom proves it's essential."
 * 6. "Axiom is crypto's wake-up call. Subscribe to stay protected."
 */

/**
 * Voiceover file paths for each scene.
 * Generate these with: POST /api/voiceover { text: "...", filename: "axiom-vo-scene1.mp3" }
 * Files are saved to cashthesis-videos/public/audio/
 */
const VOICEOVER_FILES = [
  "audio/axiom-vo-scene1.mp3",
  "audio/axiom-vo-scene2.mp3",
  "audio/axiom-vo-scene3.mp3",
  "audio/axiom-vo-scene4.mp3",
  "audio/axiom-vo-scene5.mp3",
  "audio/axiom-vo-scene6.mp3",
];

export const AxiomScandal: React.FC = () => {
  const { fps } = useVideoConfig();

  // Scene start frames
  const s1 = 0;
  const s2 = SCENE_DURATION;
  const s3 = SCENE_DURATION * 2;
  const s4 = SCENE_DURATION * 3;
  const s5 = SCENE_DURATION * 4;
  const s6 = SCENE_DURATION * 5;

  const sceneStarts = [s1, s2, s3, s4, s5, s6];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* ==================== AUDIO LAYERS ==================== */}

      {/* Background music — loops entire composition */}
      <BackgroundMusic
        remoteSrc="https://remotion.media/whoosh.wav"
        volume={0.15}
        fadeInSec={1}
        fadeOutSec={2}
      />

      {/* Voiceover tracks — one per scene, delayed to scene start + 1s */}
      {sceneStarts.map((start, i) => (
        <Sequence
          key={`vo-${i}`}
          from={start + fps}
          durationInFrames={SCENE_DURATION - fps}
          premountFor={fps}
        >
          <SceneVoiceover file={VOICEOVER_FILES[i]} />
        </Sequence>
      ))}

      {/* Transition SFX — whoosh on each scene transition */}
      {[s2, s3, s4, s5, s6].map((transitionAt, i) => (
        <Sequence
          key={`sfx-${i}`}
          from={transitionAt - TRANSITION_DURATION}
          durationInFrames={TRANSITION_DURATION * 3}
          premountFor={Math.floor(fps * 0.5)}
        >
          <Audio
            src={i === 3 ? switchSfx : whooshSfx}
            volume={0.5}
          />
        </Sequence>
      ))}

      {/* ==================== VISUAL LAYERS ==================== */}

      {/* Scene 1: Hook — Breaking Scandal Alert */}
      <Sequence from={s1} durationInFrames={SCENE_DURATION} premountFor={fps}>
        <Scene1Hook />
      </Sequence>

      {/* Transition 1→2 */}
      <Sequence
        from={s2 - TRANSITION_DURATION}
        durationInFrames={TRANSITION_DURATION}
        premountFor={Math.floor(fps * 0.5)}
      >
        <GlitchTransition />
      </Sequence>

      {/* Scene 2: The Crime Breakdown */}
      <Sequence from={s2} durationInFrames={SCENE_DURATION} premountFor={fps}>
        <Scene2Crime />
      </Sequence>

      {/* Transition 2→3 */}
      <Sequence
        from={s3 - TRANSITION_DURATION}
        durationInFrames={TRANSITION_DURATION}
        premountFor={Math.floor(fps * 0.5)}
      >
        <GlitchTransition />
      </Sequence>

      {/* Scene 3: Scale of Damage */}
      <Sequence from={s3} durationInFrames={SCENE_DURATION} premountFor={fps}>
        <Scene3Scale />
      </Sequence>

      {/* Transition 3→4 */}
      <Sequence
        from={s4 - TRANSITION_DURATION}
        durationInFrames={TRANSITION_DURATION}
        premountFor={Math.floor(fps * 0.5)}
      >
        <GlitchTransition />
      </Sequence>

      {/* Scene 4: The Flaw Exposed */}
      <Sequence from={s4} durationInFrames={SCENE_DURATION} premountFor={fps}>
        <Scene4Flaw />
      </Sequence>

      {/* Transition 4→5: Green glow expand */}
      <Sequence
        from={s5 - TRANSITION_DURATION}
        durationInFrames={TRANSITION_DURATION}
        premountFor={Math.floor(fps * 0.5)}
      >
        <GreenGlowTransition />
      </Sequence>

      {/* Scene 5: The Solution Reveal */}
      <Sequence from={s5} durationInFrames={SCENE_DURATION} premountFor={fps}>
        <Scene5Solution />
      </Sequence>

      {/* Transition 5→6: Fade */}
      <Sequence
        from={s6 - TRANSITION_DURATION}
        durationInFrames={TRANSITION_DURATION}
        premountFor={Math.floor(fps * 0.5)}
      >
        <FadeTransition />
      </Sequence>

      {/* Scene 6: CTA + Branding */}
      <Sequence from={s6} durationInFrames={SCENE_DURATION} premountFor={fps}>
        <Scene6CTA />
      </Sequence>

      {/* Watermark — always visible */}
      <Watermark />
    </AbsoluteFill>
  );
};

// --- Scene voiceover — plays the generated MP3, silent if file not yet generated ---

import { staticFile, interpolate, useCurrentFrame } from "remotion";

const SceneVoiceover: React.FC<{ file: string }> = ({ file }) => {
  // Voiceover files are optional — the composition works without them.
  // Generate them via POST /api/voiceover, then drop in public/audio/.
  try {
    const src = staticFile(file);
    return <Audio src={src} volume={0.9} />;
  } catch {
    return null;
  }
};

// --- Green glow transition (scene 4→5) ---

const GreenGlowTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const intensity = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [0, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = interpolate(frame, [0, durationInFrames], [0.3, 2.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,230,138,${intensity}) 0%, transparent 70%)`,
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

// --- Fade transition (scene 5→6) ---

const FadeTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [0, 0.8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, opacity }} />
  );
};
