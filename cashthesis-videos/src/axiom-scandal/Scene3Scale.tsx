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
          color: COLORS.red,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Scale of Damage
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
        $390M DEX, Zero Controls
      </div>
    </div>
  );
};

// --- Animated pie chart ---

const PIE_SEGMENTS = [
  { label: "Legitimate Revenue", value: 75, color: COLORS.gold },
  { label: "Insider Theft", value: 15, color: COLORS.red },
  { label: "Unaccounted", value: 10, color: COLORS.muted },
];

const PieChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spinProgress = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const cx = 200;
  const cy = 200;
  const radius = 140;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;

  return (
    <div style={{ position: "absolute", top: 200, left: 60 }}>
      <svg width={400} height={400} viewBox="0 0 400 400">
        {PIE_SEGMENTS.map((seg, i) => {
          const segmentLength = (seg.value / 100) * circumference;
          const animatedLength = segmentLength * spinProgress;
          const rotation = cumulativeAngle * spinProgress;
          cumulativeAngle += (seg.value / 100) * 360;

          return (
            <circle
              key={i}
              r={radius}
              cx={cx}
              cy={cy}
              fill="none"
              stroke={seg.color}
              strokeWidth={40}
              strokeDasharray={`${animatedLength} ${circumference}`}
              strokeDashoffset={0}
              transform={`rotate(${rotation - 90} ${cx} ${cy})`}
              opacity={0.85}
            />
          );
        })}
        {/* Center text */}
        <text
          x={cx}
          y={cy - 15}
          textAnchor="middle"
          fill={COLORS.gold}
          fontFamily={monoFont}
          fontSize={36}
          fontWeight={700}
        >
          $390M+
        </text>
        <text
          x={cx}
          y={cy + 20}
          textAnchor="middle"
          fill={COLORS.muted}
          fontFamily={interFont}
          fontSize={18}
        >
          Revenue
        </text>
      </svg>

      {/* Legend */}
      <div style={{ marginTop: 10, paddingLeft: 40 }}>
        {PIE_SEGMENTS.map((seg, i) => {
          const legendOpacity = interpolate(
            frame,
            [1.5 * fps + i * 15, 2 * fps + i * 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
                opacity: legendOpacity,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  backgroundColor: seg.color,
                }}
              />
              <span
                style={{
                  fontFamily: interFont,
                  fontSize: 20,
                  color: COLORS.white,
                  opacity: 0.7,
                }}
              >
                {seg.label} ({seg.value}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Polymarket front-running stats ---

const PolymarketStats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    delay: Math.floor(3 * fps),
    config: { damping: 200 },
    durationInFrames: Math.floor(1 * fps),
  });

  const translateX = interpolate(slideIn, [0, 1], [400, 0]);

  // Animated odds counter
  const oddsFrame = Math.max(0, frame - Math.floor(4 * fps));
  const oddsProgress = interpolate(oddsFrame, [0, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const odds = interpolate(oddsProgress, [0, 1], [13.8, 100]);

  // Profit counter
  const profitProgress = interpolate(oddsFrame, [0.5 * fps, 2.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const profit = interpolate(profitProgress, [0, 1], [0, 1000000]);

  return (
    <div
      style={{
        position: "absolute",
        top: 900,
        left: 60,
        right: 60,
        transform: `translateX(${translateX}px)`,
        opacity: slideIn,
      }}
    >
      <div
        style={{
          fontFamily: monoFont,
          fontSize: 16,
          color: COLORS.muted,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Polymarket Front-Running
      </div>

      {/* Stats grid */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* Wallets */}
        <div
          style={{
            flex: 1,
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            padding: "20px 16px",
            border: `1px solid rgba(255,255,255,0.05)`,
          }}
        >
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 48,
              fontWeight: 700,
              color: COLORS.red,
            }}
          >
            12
          </div>
          <div
            style={{
              fontFamily: interFont,
              fontSize: 16,
              color: COLORS.muted,
              marginTop: 4,
            }}
          >
            Insider Wallets
          </div>
        </div>

        {/* Odds */}
        <div
          style={{
            flex: 1,
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            padding: "20px 16px",
            border: `1px solid rgba(255,255,255,0.05)`,
          }}
        >
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 48,
              fontWeight: 700,
              color: COLORS.gold,
            }}
          >
            {odds.toFixed(1)}%
          </div>
          <div
            style={{
              fontFamily: interFont,
              fontSize: 16,
              color: COLORS.muted,
              marginTop: 4,
            }}
          >
            Entry Odds
          </div>
        </div>
      </div>

      {/* Profit arrow */}
      <div
        style={{
          marginTop: 20,
          backgroundColor: "rgba(255,77,106,0.08)",
          border: `1px solid rgba(255,77,106,0.15)`,
          borderRadius: 12,
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: interFont,
              fontSize: 16,
              color: COLORS.muted,
            }}
          >
            Total Insider Profit
          </div>
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 56,
              fontWeight: 700,
              color: COLORS.red,
              marginTop: 4,
            }}
          >
            ${Math.floor(profit).toLocaleString()}
          </div>
        </div>
        <div
          style={{
            fontFamily: interFont,
            fontSize: 18,
            color: COLORS.muted,
          }}
        >
          One wallet: $410K
        </div>
      </div>
    </div>
  );
};

// --- Y Combinator badge ---

const YCBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [1 * fps, 1.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 180,
        right: 60,
        opacity: fadeIn,
        display: "flex",
        alignItems: "center",
        gap: 10,
        backgroundColor: "rgba(255,215,0,0.08)",
        border: `1px solid rgba(255,215,0,0.15)`,
        borderRadius: 8,
        padding: "10px 16px",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          backgroundColor: COLORS.gold,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: interFont,
          fontSize: 18,
          fontWeight: 800,
          color: COLORS.bg,
        }}
      >
        Y
      </div>
      <span
        style={{
          fontFamily: monoFont,
          fontSize: 16,
          color: COLORS.gold,
        }}
      >
        W25 Batch
      </span>
    </div>
  );
};

// --- Caption ---

const Caption3: React.FC = () => {
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
        Axiom: $390M revenue DEX, but zero controls. Insiders front-ran ZachXBT
        on Polymarket — $1M profits from leaked info.
      </div>
    </div>
  );
};

// ============================================
// Scene 3 Main Export
// ============================================

export const Scene3Scale: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence from={0} premountFor={fps}>
        <SectionHeader />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <YCBadge />
      </Sequence>

      <Sequence from={Math.floor(0.5 * fps)} premountFor={fps}>
        <PieChart />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <PolymarketStats />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <Caption3 />
      </Sequence>
    </AbsoluteFill>
  );
};
