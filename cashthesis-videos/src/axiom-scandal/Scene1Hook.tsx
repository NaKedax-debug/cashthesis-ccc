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

// --- Pulsing red background ---

const PulsingBackground: React.FC = () => {
  const frame = useCurrentFrame();

  const pulse = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.02, 0.12]
  );

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, rgba(255,77,106,${pulse}) 0%, ${COLORS.bg} 70%)`,
      }}
    />
  );
};

// --- Glitch scanlines ---

const GlitchLines: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const intensity = interpolate(frame, [0, 2 * fps], [1, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lines: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const y = ((frame * 5 + i * 160) % 1920);
    const h = 2 + (i % 4) * 2;
    const xShift = Math.sin(frame * 0.3 + i) * 20 * intensity;
    lines.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: xShift,
          right: -xShift,
          top: y,
          height: h,
          backgroundColor: COLORS.red,
          opacity: intensity * (0.1 + (i % 3) * 0.1),
        }}
      />
    );
  }

  return <AbsoluteFill style={{ overflow: "hidden" }}>{lines}</AbsoluteFill>;
};

// --- Main title: AXIOM SCANDAL EXPOSED ---

const MainTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 180 },
    durationInFrames: Math.floor(1.5 * fps),
  });

  const scale = interpolate(scaleSpring, [0, 1], [0, 1.05]);

  // Shake effect for first 2 seconds
  const shakeIntensity = interpolate(frame, [0, 2 * fps], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shakeX = Math.sin(frame * 1.5) * shakeIntensity;
  const shakeY = Math.cos(frame * 1.3) * shakeIntensity;

  // Glow pulse
  const glowPulse = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [10, 30]
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "28%",
        left: 40,
        right: 40,
        textAlign: "center",
        transform: `scale(${scale}) translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: monoFont,
          fontSize: 88,
          fontWeight: 700,
          color: COLORS.gold,
          lineHeight: 1.15,
          textShadow: `0 0 ${glowPulse}px ${COLORS.gold}, 0 0 ${glowPulse * 2}px rgba(255,215,0,0.3)`,
          letterSpacing: -2,
        }}
      >
        AXIOM SCANDAL
      </div>
      <div
        style={{
          fontFamily: monoFont,
          fontSize: 100,
          fontWeight: 700,
          color: COLORS.red,
          lineHeight: 1.1,
          textShadow: `0 0 ${glowPulse}px ${COLORS.red}, 0 0 ${glowPulse * 2}px rgba(255,77,106,0.4)`,
          letterSpacing: 4,
          marginTop: 10,
        }}
      >
        EXPOSED
      </div>
    </div>
  );
};

// --- Dripping wallet icons ---

const WALLETS = [
  { x: 15, delay: 30, size: 48 },
  { x: 35, delay: 50, size: 40 },
  { x: 55, delay: 20, size: 52 },
  { x: 75, delay: 45, size: 44 },
  { x: 90, delay: 60, size: 38 },
];

const WalletIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="4" y="12" width="40" height="28" rx="4" stroke={COLORS.red} strokeWidth="2.5" fill="none" />
    <rect x="4" y="12" width="40" height="10" rx="4" fill={COLORS.red} opacity={0.3} />
    <circle cx="36" cy="30" r="4" fill={COLORS.red} />
    <path d="M4 18h40" stroke={COLORS.red} strokeWidth="1.5" opacity={0.5} />
  </svg>
);

const DrippingWallets: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {WALLETS.map((w, i) => {
        const dropFrame = Math.max(0, frame - w.delay);
        const dropProgress = interpolate(dropFrame, [0, 3 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.quad),
        });
        const y = interpolate(dropProgress, [0, 1], [1500, 1920 + 60]);
        const opacity = interpolate(dropProgress, [0, 0.1, 0.7, 1], [0, 0.8, 0.6, 0]);

        // Drip trail
        const trailHeight = interpolate(dropProgress, [0, 0.5, 1], [0, 80, 160], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <React.Fragment key={i}>
            {/* Trail */}
            <div
              style={{
                position: "absolute",
                left: `${w.x}%`,
                top: y - trailHeight,
                width: 3,
                height: trailHeight,
                background: `linear-gradient(to bottom, transparent, ${COLORS.red})`,
                opacity: opacity * 0.4,
                transform: "translateX(-1.5px)",
              }}
            />
            {/* Wallet */}
            <div
              style={{
                position: "absolute",
                left: `${w.x}%`,
                top: y,
                opacity,
                transform: `translateX(-${w.size / 2}px)`,
              }}
            >
              <WalletIcon size={w.size} />
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// --- Caption with typewriter ---

const CAPTION = "Axiom Exchange insiders caught red-handed: abusing private wallet data for massive profits. ZachXBT just dropped the bomb.";
const CHARS_PER_FRAME = 0.7;

const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const charCount = Math.min(
    CAPTION.length,
    Math.floor(frame * CHARS_PER_FRAME)
  );
  const displayText = CAPTION.slice(0, charCount);
  const isTyping = charCount < CAPTION.length;
  const cursorVisible = isTyping && Math.floor(frame / 8) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 160,
        left: 60,
        right: 60,
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          fontFamily: interFont,
          fontSize: 36,
          fontWeight: 600,
          color: COLORS.green,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        {displayText}
        {cursorVisible && (
          <span style={{ color: COLORS.green, fontWeight: 400 }}>|</span>
        )}
      </div>
    </div>
  );
};

// --- Alert badge ---

const AlertBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideDown = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.floor(0.5 * fps),
  });

  const translateY = interpolate(slideDown, [0, 1], [-80, 0]);

  const dotOpacity = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.4, 1]
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.red,
          padding: "16px 40px",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: COLORS.white,
            opacity: dotOpacity,
          }}
        />
        <span
          style={{
            fontFamily: monoFont,
            fontSize: 26,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Insider Trading Alert
        </span>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: COLORS.white,
            opacity: dotOpacity,
          }}
        />
      </div>
    </div>
  );
};

// ============================================
// Scene 1 Main Export
// ============================================

export const Scene1Hook: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <PulsingBackground />
      <GlitchLines />

      <Sequence from={0} premountFor={fps}>
        <AlertBadge />
      </Sequence>

      <Sequence from={Math.floor(0.3 * fps)} premountFor={fps}>
        <MainTitle />
      </Sequence>

      <Sequence from={Math.floor(1.5 * fps)} premountFor={fps}>
        <DrippingWallets />
      </Sequence>

      <Sequence from={Math.floor(2.5 * fps)} premountFor={fps}>
        <Caption />
      </Sequence>
    </AbsoluteFill>
  );
};
