import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { COLORS, interFont, monoFont } from "./constants";

const GRID_COLS = 16;
const GRID_ROWS = 16;
const BOX_SIZE = 12;
const BOX_GAP = 2;

// Indices for highlighted experts (row * GRID_COLS + col)
const GREEN_INDICES = [18, 35, 67, 98, 130, 165, 200, 240];
const GOLD_INDEX = 127;

const TOTAL_BOXES = GRID_COLS * GRID_ROWS;

// Stat card definitions
const STAT_CARDS: Array<{
  targetNumber: number;
  suffix: string;
  subtext?: string;
  subColor?: string;
  label: string;
  color: string;
  delayFrames: number;
}> = [
  {
    targetNumber: 35,
    suffix: "B",
    subtext: "3B Active",
    subColor: COLORS.gold,
    label: "Parameters",
    color: COLORS.green,
    delayFrames: 0,
  },
  {
    targetNumber: 262,
    suffix: "K",
    label: "Token Context \u00b7 Native",
    color: COLORS.blue,
    delayFrames: 36, // ~1.5s
  },
  {
    targetNumber: 6,
    suffix: "\u00d7",
    label: "vs Previous Generation",
    color: COLORS.gold,
    delayFrames: 72, // ~3s
  },
];

const ExpertGrid: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const gridWidth = GRID_COLS * (BOX_SIZE + BOX_GAP) - BOX_GAP;
  const gridHeight = GRID_ROWS * (BOX_SIZE + BOX_GAP) - BOX_GAP;

  // Total scan duration: boxes reveal left-to-right over ~4 seconds
  const scanDuration = fps * 4;

  return (
    <div
      style={{
        position: "relative",
        width: gridWidth,
        height: gridHeight,
      }}
    >
      {Array.from({ length: TOTAL_BOXES }).map((_, i) => {
        const col = i % GRID_COLS;
        const row = Math.floor(i / GRID_COLS);

        // Left-to-right scan: delay based on column primarily, row secondarily
        const linearIndex = col * GRID_ROWS + row;
        const delay = (linearIndex / TOTAL_BOXES) * scanDuration;

        const opacity = interpolate(frame, [delay, delay + 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const isGreen = GREEN_INDICES.includes(i);
        const isGold = i === GOLD_INDEX;

        let bgColor: string;
        let borderColor: string;
        if (isGreen) {
          bgColor = COLORS.green;
          borderColor = COLORS.green;
        } else if (isGold) {
          bgColor = COLORS.gold;
          borderColor = COLORS.gold;
        } else {
          bgColor = COLORS.surface;
          borderColor = "rgba(255,255,255,0.1)";
        }

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: col * (BOX_SIZE + BOX_GAP),
              top: row * (BOX_SIZE + BOX_GAP),
              width: BOX_SIZE,
              height: BOX_SIZE,
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 2,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

const StatCard: React.FC<{
  frame: number;
  fps: number;
  targetNumber: number;
  suffix: string;
  subtext?: string;
  subColor?: string;
  label: string;
  color: string;
  delayFrames: number;
}> = ({
  frame,
  fps,
  targetNumber,
  suffix,
  subtext,
  subColor,
  label,
  color,
  delayFrames,
}) => {
  // Slide in from right using spring
  const slideProgress = spring({
    frame: frame - delayFrames,
    fps,
    config: {
      damping: 14,
      stiffness: 80,
      mass: 0.8,
    },
  });

  const translateX = interpolate(slideProgress, [0, 1], [300, 0]);
  const cardOpacity = interpolate(slideProgress, [0, 1], [0, 1]);

  // Counter animation: starts after card is mostly visible
  const counterStart = delayFrames + Math.round(fps * 0.5);
  const counterEnd = counterStart + Math.round(fps * 1.2);
  const currentNumber = Math.round(
    interpolate(frame, [counterStart, counterEnd], [0, targetNumber], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  return (
    <div
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.05)",
        padding: "20px 28px",
        opacity: cardOpacity,
        transform: `translateX(${translateX}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <span
          style={{
            fontFamily: monoFont,
            fontSize: 56,
            fontWeight: 700,
            color,
            lineHeight: 1,
          }}
        >
          {currentNumber}
          {suffix}
        </span>
        {subtext && (
          <span
            style={{
              fontFamily: monoFont,
              fontSize: 24,
              color: subColor || COLORS.muted,
              lineHeight: 1,
            }}
          >
            {"\u2192 "}
            {subtext}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: interFont,
          fontSize: 16,
          color: COLORS.muted,
          marginTop: 4,
        }}
      >
        {label}
      </span>
    </div>
  );
};

export const Scene2WhatIs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in the whole scene
  const sceneOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Architecture label fade in
  const labelOpacity = interpolate(frame, [6, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bottom text fade in after grid scan
  const bottomTextDelay = fps * 4.5;
  const bottomTextOpacity = interpolate(
    frame,
    [bottomTextDelay, bottomTextDelay + 12],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 80px",
        gap: 80,
        opacity: sceneOpacity,
      }}
    >
      {/* LEFT SIDE - Architecture Diagram */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {/* Section label */}
        <span
          style={{
            fontFamily: monoFont,
            fontSize: 16,
            color: COLORS.muted,
            textTransform: "uppercase",
            letterSpacing: 4,
            opacity: labelOpacity,
          }}
        >
          ARCHITECTURE
        </span>

        {/* Expert grid */}
        <ExpertGrid frame={frame} fps={fps} />

        {/* Grid labels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: bottomTextOpacity,
          }}
        >
          <span
            style={{
              fontFamily: monoFont,
              fontSize: 18,
              color: COLORS.green,
            }}
          >
            256 Experts &middot; 8 Routed &middot; 1 Shared
          </span>
          <span
            style={{
              fontFamily: interFont,
              fontSize: 22,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            LINEAR ATTENTION + HYBRID DESIGN
          </span>
        </div>
      </div>

      {/* RIGHT SIDE - Stat Cards */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
        }}
      >
        {STAT_CARDS.map((card, idx) => (
          <StatCard
            key={idx}
            frame={frame}
            fps={fps}
            targetNumber={card.targetNumber}
            suffix={card.suffix}
            subtext={card.subtext}
            subColor={card.subColor}
            label={card.label}
            color={card.color}
            delayFrames={card.delayFrames}
          />
        ))}
      </div>
    </div>
  );
};
