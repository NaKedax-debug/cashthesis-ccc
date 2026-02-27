import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Easing,
} from "remotion";
import { COLORS, interFont, monoFont } from "./constants";

// --- Pulsing subscribe button ---

const SubscribeButton: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({
    frame,
    fps,
    delay: Math.floor(0.5 * fps),
    config: { damping: 12, stiffness: 150 },
    durationInFrames: Math.floor(1 * fps),
  });

  const scale = interpolate(enterSpring, [0, 1], [0.3, 1]);

  // Breathing pulse
  const breathe = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.95, 1.05]
  );

  const glowSize = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [10, 30]
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 300,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: enterSpring,
      }}
    >
      <div
        style={{
          transform: `scale(${scale * breathe})`,
          backgroundColor: COLORS.gold,
          borderRadius: 20,
          padding: "28px 60px",
          boxShadow: `0 0 ${glowSize}px rgba(255,215,0,0.4), 0 0 ${glowSize * 2}px rgba(255,215,0,0.15)`,
        }}
      >
        <div
          style={{
            fontFamily: interFont,
            fontSize: 38,
            fontWeight: 800,
            color: COLORS.bg,
            letterSpacing: 1,
            textAlign: "center",
          }}
        >
          SUBSCRIBE
        </div>
      </div>
    </div>
  );
};

// --- Channel name ---

const ChannelName: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({
    frame,
    fps,
    delay: Math.floor(1 * fps),
    config: { damping: 200 },
    durationInFrames: Math.floor(0.8 * fps),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 180,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          fontFamily: interFont,
          fontSize: 60,
          fontWeight: 900,
          color: COLORS.green,
          letterSpacing: 2,
          textShadow: `0 0 20px rgba(0,230,138,0.3)`,
        }}
      >
        CashThesis
      </div>
      <div
        style={{
          fontFamily: interFont,
          fontSize: 22,
          fontWeight: 400,
          color: COLORS.muted,
          marginTop: 10,
        }}
      >
        AI + Crypto + Money
      </div>
    </div>
  );
};

// --- CTA text ---

const CTAText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [1.5 * fps, 2.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 430,
        left: 60,
        right: 60,
        textAlign: "center",
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          fontFamily: interFont,
          fontSize: 32,
          fontWeight: 700,
          color: COLORS.white,
          lineHeight: 1.4,
        }}
      >
        Smash Subscribe for
        <br />
        <span style={{ color: COLORS.green }}>Crypto Defenses</span>
      </div>
    </div>
  );
};

// --- Fast fact scroll ---

const FACTS = [
  "ZachXBT exposed Axiom employees abusing internal tools for 1+ year",
  "Broox Bauer planned $200K quick-profit schemes from user wallet data",
  "Axiom: $390M+ revenue, Y Combinator W25 — zero permission controls",
  "12 insider wallets front-ran on Polymarket, netting $1M profit",
  "Started with 10-20 wallets, scaled up and distributed lists",
  "On-chain transparency without privacy = insider weapon",
  "Zero-knowledge proofs: the cryptographic solution to insider abuse",
];

const FactScroll: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        top: 580,
        left: 50,
        right: 50,
        overflow: "hidden",
        height: 650,
      }}
    >
      {FACTS.map((fact, i) => {
        const factDelay = Math.floor((3 + i * 0.7) * fps);
        const factProgress = interpolate(
          frame,
          [factDelay, factDelay + Math.floor(0.5 * fps)],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              marginBottom: 16,
              opacity: factProgress,
              transform: `translateX(${interpolate(factProgress, [0, 1], [30, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: monoFont,
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.gold,
                minWidth: 28,
                lineHeight: 1.5,
              }}
            >
              {i + 1}.
            </div>
            <div
              style={{
                fontFamily: interFont,
                fontSize: 22,
                color: COLORS.white,
                opacity: 0.7,
                lineHeight: 1.5,
              }}
            >
              {fact}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- End lock + green check freeze frame ---

const EndFreeze: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [8 * fps, 9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const checkScale = spring({
    frame: Math.max(0, frame - Math.floor(8.5 * fps)),
    fps,
    config: { damping: 12 },
    durationInFrames: Math.floor(0.6 * fps),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        opacity: fadeIn,
      }}
    >
      {/* Lock icon */}
      <svg width={40} height={48} viewBox="0 0 40 48">
        <path
          d="M10 22 L10 14 C10 6 30 6 30 14 L30 22"
          fill="none"
          stroke={COLORS.green}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <rect x={5} y={22} width={30} height={22} rx={4} fill={COLORS.green} opacity={0.9} />
        <circle cx={20} cy={31} r={3} fill={COLORS.bg} />
        <rect x={18.5} y={31} width={3} height={7} rx={1} fill={COLORS.bg} />
      </svg>

      {/* Green check */}
      <div style={{ transform: `scale(${checkScale})` }}>
        <svg width={44} height={44} viewBox="0 0 44 44">
          <circle cx={22} cy={22} r={20} fill={COLORS.green} />
          <polyline
            points="12,22 19,29 32,15"
            fill="none"
            stroke={COLORS.bg}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

// --- Voiceover caption ---

const FinalCaption: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0.5 * fps, 1.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 60,
        right: 60,
        opacity: fadeIn,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: interFont,
          fontSize: 24,
          fontWeight: 600,
          color: COLORS.green,
          opacity: 0.6,
        }}
      >
        Axiom is crypto&apos;s wake-up call. Subscribe to stay protected.
      </div>
    </div>
  );
};

// ============================================
// Scene 6 Main Export
// ============================================

export const Scene6CTA: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        background: `radial-gradient(circle at 50% 30%, rgba(0,230,138,0.04) 0%, ${COLORS.bg} 70%)`,
      }}
    >
      <Sequence from={0} premountFor={fps}>
        <FinalCaption />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <ChannelName />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <SubscribeButton />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <CTAText />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <FactScroll />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <EndFreeze />
      </Sequence>
    </AbsoluteFill>
  );
};
