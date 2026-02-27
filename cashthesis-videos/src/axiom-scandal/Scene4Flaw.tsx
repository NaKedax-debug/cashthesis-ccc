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
          color: COLORS.blue,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        The Flaw
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
        Transparency = Weapon
      </div>
    </div>
  );
};

// --- Chain links that crack ---

const CHAIN_LINKS = 7;

const ChainGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const crackProgress = interpolate(frame, [1 * fps, 3 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const crackIndex = Math.floor(CHAIN_LINKS / 2); // middle link cracks

  return (
    <div
      style={{
        position: "absolute",
        top: 200,
        left: 60,
        right: 60,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 0,
      }}
    >
      {Array.from({ length: CHAIN_LINKS }).map((_, i) => {
        const isCracked = i === crackIndex;
        const nearCrack = Math.abs(i - crackIndex) <= 1;

        // Crack displacement
        const displacement = isCracked
          ? interpolate(crackProgress, [0, 0.5, 1], [0, 0, 30])
          : nearCrack
          ? interpolate(crackProgress, [0, 0.6, 1], [0, 0, 12 * (i < crackIndex ? -1 : 1)])
          : 0;

        const rotation = isCracked
          ? interpolate(crackProgress, [0.5, 1], [0, 15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          : 0;

        const linkColor = isCracked
          ? interpolate(crackProgress, [0, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          : nearCrack
          ? interpolate(crackProgress, [0.3, 0.8], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          : 0;

        const blueR = parseInt(COLORS.blue.slice(1, 3), 16);
        const blueG = parseInt(COLORS.blue.slice(3, 5), 16);
        const blueB = parseInt(COLORS.blue.slice(5, 7), 16);
        const redR = parseInt(COLORS.red.slice(1, 3), 16);
        const redG = parseInt(COLORS.red.slice(3, 5), 16);
        const redB = parseInt(COLORS.red.slice(5, 7), 16);

        const r = Math.round(blueR + (redR - blueR) * linkColor);
        const g = Math.round(blueG + (redG - blueG) * linkColor);
        const b = Math.round(blueB + (redB - blueB) * linkColor);

        // Glitch flash on crack
        const glitchFlash =
          isCracked && crackProgress > 0.45 && crackProgress < 0.55
            ? 0.6
            : 0;

        return (
          <div
            key={i}
            style={{
              transform: `translateY(${displacement}px) rotate(${rotation}deg)`,
            }}
          >
            <svg width={110} height={60} viewBox="0 0 110 60">
              <ellipse
                cx={55}
                cy={30}
                rx={45}
                ry={22}
                fill="none"
                stroke={`rgb(${r},${g},${b})`}
                strokeWidth={6}
                opacity={0.8}
              />
              {/* Crack line */}
              {isCracked && crackProgress > 0.4 && (
                <line
                  x1={55}
                  y1={8}
                  x2={55}
                  y2={52}
                  stroke={COLORS.red}
                  strokeWidth={3}
                  opacity={interpolate(crackProgress, [0.4, 0.6], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })}
                />
              )}
            </svg>
            {/* Flash overlay */}
            {glitchFlash > 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: COLORS.red,
                  opacity: glitchFlash,
                  borderRadius: "50%",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- Big quote overlay ---

const OverlayText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Reveal line by line
  const line1 = interpolate(frame, [3 * fps, 4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2 = interpolate(frame, [3.5 * fps, 4.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", top: 340, left: 60, right: 60 }}>
      <div
        style={{
          fontFamily: interFont,
          fontSize: 40,
          fontWeight: 800,
          color: COLORS.white,
          lineHeight: 1.4,
          textAlign: "center",
          opacity: line1,
          transform: `translateY(${interpolate(line1, [0, 1], [20, 0])}px)`,
        }}
      >
        On-Chain Transparency
      </div>
      <div
        style={{
          fontFamily: interFont,
          fontSize: 40,
          fontWeight: 800,
          color: COLORS.red,
          lineHeight: 1.4,
          textAlign: "center",
          opacity: line2,
          transform: `translateY(${interpolate(line2, [0, 1], [20, 0])}px)`,
        }}
      >
        = Insider Weapon
      </div>
    </div>
  );
};

// --- Flow diagram: Wallet → No Privacy → Employee Access → Front-Run ---

const FLOW_STEPS = [
  { label: "Your Wallet", icon: "💰", color: COLORS.green },
  { label: "No Privacy Layer", icon: "🔓", color: COLORS.muted },
  { label: "Employee Access", icon: "👁", color: COLORS.red },
  { label: "Front-Run", icon: "💀", color: COLORS.red },
];

const FlowDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        top: 560,
        left: 40,
        right: 40,
      }}
    >
      {FLOW_STEPS.map((step, i) => {
        const stepDelay = Math.floor((4 + i * 0.8) * fps);
        const stepProgress = spring({
          frame: Math.max(0, frame - stepDelay),
          fps,
          config: { damping: 200 },
          durationInFrames: Math.floor(0.6 * fps),
        });

        const arrowDelay = stepDelay + Math.floor(0.3 * fps);
        const arrowProgress = interpolate(
          frame,
          [arrowDelay, arrowDelay + Math.floor(0.4 * fps)],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <React.Fragment key={i}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 8,
                opacity: stepProgress,
                transform: `translateX(${interpolate(stepProgress, [0, 1], [-40, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 10,
                  backgroundColor: COLORS.surface,
                  border: `2px solid ${step.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {step.icon}
              </div>
              <div
                style={{
                  fontFamily: interFont,
                  fontSize: 28,
                  fontWeight: 700,
                  color: step.color,
                }}
              >
                {step.label}
              </div>
            </div>
            {/* Arrow between steps */}
            {i < FLOW_STEPS.length - 1 && (
              <div
                style={{
                  marginLeft: 23,
                  marginBottom: 8,
                  opacity: arrowProgress,
                }}
              >
                <svg width={6} height={32} viewBox="0 0 6 32">
                  <line
                    x1={3}
                    y1={0}
                    x2={3}
                    y2={24}
                    stroke={COLORS.muted}
                    strokeWidth={2}
                    opacity={0.4}
                  />
                  <polygon points="0,24 6,24 3,32" fill={COLORS.muted} opacity={0.4} />
                </svg>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// --- Stat callout ---

const StatCallout: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [5 * fps, 6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 1100,
        left: 60,
        right: 60,
        opacity: fadeIn,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: "20px 24px",
        border: `1px solid rgba(255,77,106,0.15)`,
      }}
    >
      <div
        style={{
          fontFamily: interFont,
          fontSize: 22,
          color: COLORS.muted,
          marginBottom: 8,
        }}
      >
        Started small to avoid suspicion:
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
        <span
          style={{
            fontFamily: monoFont,
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.red,
          }}
        >
          10-20
        </span>
        <span
          style={{
            fontFamily: interFont,
            fontSize: 24,
            color: COLORS.white,
            opacity: 0.6,
          }}
        >
          wallets queried initially
        </span>
      </div>
      <div
        style={{
          fontFamily: interFont,
          fontSize: 18,
          color: COLORS.muted,
          marginTop: 8,
        }}
      >
        Then scaled up and distributed lists to accomplices
      </div>
    </div>
  );
};

// --- Caption ---

const Caption4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [7 * fps, 8 * fps], [0, 1], {
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
        Started small: 10-20 wallets to dodge flags. Proves crypto needs privacy
        from insiders — not just outsiders.
      </div>
    </div>
  );
};

// ============================================
// Scene 4 Main Export
// ============================================

export const Scene4Flaw: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence from={0} premountFor={fps}>
        <SectionHeader />
      </Sequence>

      <Sequence from={Math.floor(0.5 * fps)} premountFor={fps}>
        <ChainGraphic />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <OverlayText />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <FlowDiagram />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <StatCallout />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <Caption4 />
      </Sequence>
    </AbsoluteFill>
  );
};
