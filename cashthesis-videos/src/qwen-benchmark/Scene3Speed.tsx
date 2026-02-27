import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, interFont, monoFont } from "./constants";

/* ------------------------------------------------------------------ */
/*  Speed Comparison Bars (Left Column)                                */
/* ------------------------------------------------------------------ */

interface BarData {
  label: string;
  value: number;
  displayValue: string;
  color: string;
  maxValue: number;
}

const BARS: BarData[] = [
  {
    label: "Local (5060)",
    value: 45,
    displayValue: "45 t/s",
    color: COLORS.green,
    maxValue: 166,
  },
  {
    label: "API (Alibaba)",
    value: 166,
    displayValue: "166 t/s",
    color: COLORS.gold,
    maxValue: 166,
  },
  {
    label: "Dense 27B",
    value: 40,
    displayValue: "~40 t/s",
    color: COLORS.blue,
    maxValue: 166,
  },
];

const BAR_HEIGHT = 28;
const BAR_GAP = 20;
const BAR_MAX_WIDTH = 320;

/* ------------------------------------------------------------------ */
/*  Context Window Items (Right Column)                                */
/* ------------------------------------------------------------------ */

interface ContextItem {
  icon: string;
  text: string;
}

const CONTEXT_ITEMS: ContextItem[] = [
  { icon: "\u{1F4C4}", text: "= 200+ Page Document" },
  { icon: "\u{1F4BB}", text: "= Entire Codebase" },
  { icon: "\u{1F4AC}", text: "= Full Conversation" },
  { icon: "\u{1F5BC}\uFE0F", text: "= Multimodal (Images)" },
];

/* ------------------------------------------------------------------ */
/*  SVG Speedometer Arc helpers                                        */
/* ------------------------------------------------------------------ */

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startAngle));
  const y1 = cy + r * Math.sin(rad(startAngle));
  const x2 = cx + r * Math.cos(rad(endAngle));
  const y2 = cy + r * Math.sin(rad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

/* ------------------------------------------------------------------ */
/*  Scene Component                                                    */
/* ------------------------------------------------------------------ */

export const Scene3Speed: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Speedometer gauge animation (center) ---
  // Arc spans 180 degrees (from 180 to 360, i.e. bottom semicircle)
  const ARC_START = 180;
  const ARC_END = 360;
  const ARC_TOTAL = ARC_END - ARC_START; // 180 degrees
  const TARGET_RATIO = 45 / 166; // ~27%
  const TARGET_ANGLE = ARC_START + ARC_TOTAL * TARGET_RATIO;

  const gaugeAngle = interpolate(
    frame,
    [0, 2 * fps],
    [ARC_START, TARGET_ANGLE],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    },
  );

  // Counter 0 → 45 over 2 seconds
  const counterRaw = interpolate(frame, [0, 2 * fps], [0, 45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const counterValue = Math.floor(counterRaw);

  // "on 16GB GPU" label fades in at 1.5s
  const gpuLabelOpacity = interpolate(
    frame,
    [1.5 * fps, 2.2 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // --- Speed bars animation (left) ---
  const barSprings = BARS.map((_, i) => {
    const delay = Math.round(i * 1 * fps); // 0s, 1s, 2s stagger
    return spring({
      frame: Math.max(0, frame - delay),
      fps,
      config: { damping: 15, stiffness: 120 },
    });
  });

  // --- Context items animation (right) ---
  const contextAnimations = CONTEXT_ITEMS.map((_, i) => {
    const staggerDelay = Math.round(0.5 * fps); // 12 frames each
    const startFrame = 1 * fps + i * staggerDelay; // start at 1s, stagger 0.5s
    const opacity = interpolate(
      frame,
      [startFrame, startFrame + 0.5 * fps],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const translateY = interpolate(
      frame,
      [startFrame, startFrame + 0.5 * fps],
      [10, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return { opacity, translateY };
  });

  // Context header animation
  const contextHeaderOpacity = interpolate(
    frame,
    [0.5 * fps, 1 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // SVG gauge dimensions
  const svgSize = 300;
  const cx = svgSize / 2;
  const cy = svgSize / 2 + 20; // shift center down a bit so arc is centered visually
  const radius = 120;
  const strokeWidth = 14;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        gap: 60,
      }}
    >
      {/* ============ LEFT COLUMN - Speed Comparison Bars ============ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: BAR_GAP,
        }}
      >
        {BARS.map((bar, i) => {
          const barWidth = interpolate(
            barSprings[i],
            [0, 1],
            [0, (bar.value / bar.maxValue) * BAR_MAX_WIDTH],
          );

          const labelOpacity = interpolate(
            barSprings[i],
            [0, 0.3],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          const valueOpacity = interpolate(
            barSprings[i],
            [0.5, 1],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Label */}
              <span
                style={{
                  fontFamily: interFont,
                  fontSize: 18,
                  fontWeight: 600,
                  color: `${COLORS.white}cc`,
                  width: 140,
                  textAlign: "right",
                  flexShrink: 0,
                  opacity: labelOpacity,
                }}
              >
                {bar.label}
              </span>

              {/* Bar */}
              <div
                style={{
                  height: BAR_HEIGHT,
                  width: barWidth,
                  backgroundColor: bar.color,
                  borderRadius: BAR_HEIGHT / 2,
                  boxShadow: `0 0 16px ${bar.color}50`,
                }}
              />

              {/* Value */}
              <span
                style={{
                  fontFamily: monoFont,
                  fontSize: 20,
                  fontWeight: 700,
                  color: bar.color,
                  opacity: valueOpacity,
                  whiteSpace: "nowrap",
                }}
              >
                {bar.displayValue}
              </span>
            </div>
          );
        })}
      </div>

      {/* ============ CENTER COLUMN - Speedometer Gauge ============ */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ position: "relative", width: svgSize, height: svgSize / 2 + 60 }}>
          <svg
            width={svgSize}
            height={svgSize / 2 + 60}
            viewBox={`0 0 ${svgSize} ${svgSize / 2 + 60}`}
          >
            {/* Background arc */}
            <path
              d={describeArc(cx, cy, radius, ARC_START, ARC_END)}
              fill="none"
              stroke={`${COLORS.white}1a`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Animated fill arc */}
            {gaugeAngle > ARC_START + 0.5 && (
              <path
                d={describeArc(cx, cy, radius, ARC_START, gaugeAngle)}
                fill="none"
                stroke={COLORS.green}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${COLORS.green}80)`,
                }}
              />
            )}
          </svg>

          {/* Center text overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: svgSize,
              height: svgSize / 2 + 60,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 20,
            }}
          >
            <span
              style={{
                fontFamily: monoFont,
                fontSize: 72,
                fontWeight: 700,
                color: COLORS.green,
                lineHeight: 1,
                textShadow: `0 0 30px ${COLORS.green}60`,
              }}
            >
              {counterValue}
            </span>
            <span
              style={{
                fontFamily: monoFont,
                fontSize: 24,
                fontWeight: 400,
                color: COLORS.muted,
                marginTop: 4,
              }}
            >
              t/s
            </span>
          </div>
        </div>

        {/* GPU label below gauge */}
        <span
          style={{
            fontFamily: interFont,
            fontSize: 20,
            fontWeight: 400,
            color: `${COLORS.white}80`,
            marginTop: 8,
            opacity: gpuLabelOpacity,
          }}
        >
          on 16GB GPU
        </span>
      </div>

      {/* ============ RIGHT COLUMN - Context Window Stack ============ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingLeft: 20,
        }}
      >
        {/* Header */}
        <span
          style={{
            fontFamily: monoFont,
            fontSize: 32,
            fontWeight: 700,
            color: COLORS.blue,
            marginBottom: 28,
            opacity: contextHeaderOpacity,
            textShadow: `0 0 20px ${COLORS.blue}40`,
          }}
        >
          262,144 TOKENS
        </span>

        {/* Context items */}
        {CONTEXT_ITEMS.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: i < CONTEXT_ITEMS.length - 1 ? 18 : 0,
              opacity: contextAnimations[i].opacity,
              transform: `translateY(${contextAnimations[i].translateY}px)`,
            }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span
              style={{
                fontFamily: interFont,
                fontSize: 20,
                fontWeight: 600,
                color: `${COLORS.white}cc`,
                whiteSpace: "nowrap",
              }}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
