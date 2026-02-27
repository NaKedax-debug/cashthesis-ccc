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

// --- Section header ---

const SectionHeader: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", top: 60, left: 60, right: 60, opacity }}>
      <div
        style={{
          fontFamily: monoFont,
          fontSize: 20,
          fontWeight: 400,
          color: COLORS.green,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        The Solution
      </div>
      <div
        style={{
          fontFamily: interFont,
          fontSize: 44,
          fontWeight: 800,
          color: COLORS.white,
          lineHeight: 1.2,
        }}
      >
        Programmable Privacy
      </div>
    </div>
  );
};

// --- Lock icon assembling from ZK shield parts ---

const ShieldIcon: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = Math.floor(1 * fps + index * 12);
  const assembleProgress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 15, stiffness: 180 },
    durationInFrames: Math.floor(0.8 * fps),
  });

  const scale = interpolate(assembleProgress, [0, 1], [0.3, 1]);
  const opacity = assembleProgress;

  // Position in a circle
  const angle = (index / 5) * Math.PI * 2 - Math.PI / 2;
  const radius = 110;
  const finalX = Math.cos(angle) * radius;
  const finalY = Math.sin(angle) * radius;
  const startX = Math.cos(angle) * 250;
  const startY = Math.sin(angle) * 250;

  const x = interpolate(assembleProgress, [0, 1], [startX, finalX]);
  const y = interpolate(assembleProgress, [0, 1], [startY, finalY]);

  return (
    <div
      style={{
        position: "absolute",
        left: `calc(50% + ${x}px - 30px)`,
        top: `calc(50% + ${y}px - 30px)`,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <svg width={60} height={60} viewBox="0 0 60 60">
        <path
          d="M30 5 L50 15 L50 35 C50 48 30 55 30 55 C30 55 10 48 10 35 L10 15 Z"
          fill="none"
          stroke={COLORS.green}
          strokeWidth={3}
          opacity={0.8}
        />
        <text
          x={30}
          y={36}
          textAnchor="middle"
          fill={COLORS.green}
          fontSize={22}
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          ZK
        </text>
      </svg>
    </div>
  );
};

// --- Central lock ---

const CentralLock: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lockSpring = spring({
    frame,
    fps,
    delay: Math.floor(2.5 * fps),
    config: { damping: 12 },
    durationInFrames: Math.floor(1 * fps),
  });

  const scale = interpolate(lockSpring, [0, 1], [0, 1.1]);
  const glowSize = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [15, 35]
  );

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: lockSpring,
      }}
    >
      <svg width={80} height={90} viewBox="0 0 80 90">
        {/* Glow */}
        <defs>
          <filter id="lockGlow">
            <feGaussianBlur stdDeviation={glowSize / 4} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Shackle */}
        <path
          d="M20 40 L20 25 C20 12 60 12 60 25 L60 40"
          fill="none"
          stroke={COLORS.green}
          strokeWidth={6}
          strokeLinecap="round"
          filter="url(#lockGlow)"
        />
        {/* Body */}
        <rect
          x={12}
          y={40}
          width={56}
          height={42}
          rx={6}
          fill={COLORS.green}
          opacity={0.9}
        />
        {/* Keyhole */}
        <circle cx={40} cy={55} r={6} fill={COLORS.bg} />
        <rect x={37} y={55} width={6} height={14} rx={2} fill={COLORS.bg} />
      </svg>
    </div>
  );
};

const ShieldAssembly: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 180,
        left: 0,
        right: 0,
        height: 320,
      }}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <ShieldIcon key={i} index={i} />
      ))}
      <CentralLock />
    </div>
  );
};

// --- Side by side comparison ---

const ComparisonView: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealProgress = interpolate(frame, [3.5 * fps, 5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Left side glitch effect
  const glitchOffset = frame > 4 * fps
    ? Math.sin(frame * 0.5) * interpolate(frame, [4 * fps, 6 * fps], [0, 6], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <div
      style={{
        position: "absolute",
        top: 550,
        left: 40,
        right: 40,
        display: "flex",
        gap: 16,
        opacity: revealProgress,
      }}
    >
      {/* Without Privacy */}
      <div
        style={{
          flex: 1,
          backgroundColor: "rgba(255,77,106,0.06)",
          border: `1px solid rgba(255,77,106,0.15)`,
          borderRadius: 16,
          padding: "24px 20px",
          transform: `translateX(${glitchOffset}px)`,
        }}
      >
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 16,
            color: COLORS.red,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Without Privacy
        </div>
        {/* Red chaos indicators */}
        {["Wallet exposed", "Data queried", "Front-run"].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: COLORS.red,
              }}
            />
            <span
              style={{
                fontFamily: interFont,
                fontSize: 20,
                color: COLORS.red,
                opacity: 0.8,
              }}
            >
              {item}
            </span>
          </div>
        ))}
        {/* Glitch lines */}
        <div
          style={{
            marginTop: 12,
            height: 3,
            backgroundColor: COLORS.red,
            opacity: 0.3,
            width: `${60 + Math.sin(frame * 0.3) * 20}%`,
          }}
        />
        <div
          style={{
            marginTop: 4,
            height: 2,
            backgroundColor: COLORS.red,
            opacity: 0.15,
            width: `${40 + Math.cos(frame * 0.2) * 15}%`,
          }}
        />
      </div>

      {/* With Privacy */}
      <div
        style={{
          flex: 1,
          backgroundColor: "rgba(0,230,138,0.06)",
          border: `1px solid rgba(0,230,138,0.15)`,
          borderRadius: 16,
          padding: "24px 20px",
        }}
      >
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 16,
            color: COLORS.green,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Programmable Privacy
        </div>
        {["Data encrypted", "ZK-verified", "Insider-proof"].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <svg width={16} height={16} viewBox="0 0 16 16">
              <circle cx={8} cy={8} r={7} fill="none" stroke={COLORS.green} strokeWidth={1.5} />
              <polyline
                points="4,8 7,11 12,5"
                fill="none"
                stroke={COLORS.green}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontFamily: interFont,
                fontSize: 20,
                color: COLORS.green,
                opacity: 0.8,
              }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Code snippet typewriter ---

const CODE_TEXT = `zkProve(privateWallet, {
  hideBalance: true,
  hideHistory: true,
  verifyOwnership: true,
})`;

const CodeSnippet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = Math.floor(5 * fps);
  const typeFrame = Math.max(0, frame - startFrame);
  const charCount = Math.min(CODE_TEXT.length, Math.floor(typeFrame * 0.8));
  const displayCode = CODE_TEXT.slice(0, charCount);
  const isTyping = charCount < CODE_TEXT.length && frame >= startFrame;
  const cursorVisible = isTyping && Math.floor(frame / 8) % 2 === 0;

  const fadeIn = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 940,
        left: 40,
        right: 40,
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: 12,
          border: `1px solid rgba(0,230,138,0.1)`,
          padding: "20px 24px",
          overflow: "hidden",
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: COLORS.red, opacity: 0.6 }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: COLORS.gold, opacity: 0.6 }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: COLORS.green, opacity: 0.6 }} />
          <span
            style={{
              fontFamily: monoFont,
              fontSize: 13,
              color: COLORS.muted,
              marginLeft: 12,
            }}
          >
            privacy.ts
          </span>
        </div>
        <pre
          style={{
            fontFamily: monoFont,
            fontSize: 22,
            color: COLORS.green,
            lineHeight: 1.6,
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {displayCode}
          {cursorVisible && (
            <span style={{ color: COLORS.green }}>|</span>
          )}
        </pre>
      </div>
    </div>
  );
};

// --- Caption ---

const Caption5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [7.5 * fps, 8.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 60,
        right: 60,
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          fontFamily: interFont,
          fontSize: 28,
          fontWeight: 600,
          color: COLORS.green,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        Enter programmable privacy protocols: Zero-knowledge tech hides your
        data — even from exchange employees. Axiom proves it&apos;s essential.
      </div>
    </div>
  );
};

// ============================================
// Scene 5 Main Export
// ============================================

export const Scene5Solution: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence from={0} premountFor={fps}>
        <SectionHeader />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <ShieldAssembly />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <ComparisonView />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <CodeSnippet />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <Caption5 />
      </Sequence>
    </AbsoluteFill>
  );
};
