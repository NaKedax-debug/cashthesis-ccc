import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, interFont, monoFont } from "./constants";

const USE_CASES = [
  {
    title: "AI Content Pipeline",
    description: "Blog posts, video scripts — no API costs",
  },
  {
    title: "Local Coding Assistant",
    description: "Vibe coding with instant responses",
  },
  {
    title: "Crypto Analysis Agent",
    description: "262K context for market patterns",
  },
] as const;

const Checkmark: React.FC<{ progress: number }> = ({ progress }) => {
  const circumference = 2 * Math.PI * 9;
  const checkLength = 16;

  const circleOffset = interpolate(progress, [0, 0.5], [circumference, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const checkOffset = interpolate(progress, [0.4, 1], [checkLength, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <circle
        cx={12}
        cy={12}
        r={9}
        stroke={COLORS.green}
        strokeWidth={2}
        strokeDasharray={circumference}
        strokeDashoffset={circleOffset}
        strokeLinecap="round"
        fill="none"
      />
      <polyline
        points="8,12 11,15 16,9"
        stroke={COLORS.green}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={checkLength}
        strokeDashoffset={checkOffset}
        fill="none"
      />
    </svg>
  );
};

export const Scene4SideHustle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Header fade in over 0.5s ---
  const headerOpacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Cost counter: 0 → 1000 over 2s ---
  const costValue = Math.round(
    interpolate(frame, [0, 2 * fps], [0, 1000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // --- ROI counter: 0 → 6000 over 3s, delay 1s ---
  const roiDelay = Math.round(1 * fps);
  const roiValue = Math.round(
    interpolate(frame, [roiDelay, roiDelay + 3 * fps], [0, 6000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // --- ROI fade in ---
  const roiOpacity = interpolate(frame, [roiDelay, roiDelay + 0.3 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Use case cards: spring with stagger delays 2s, 3s, 4s ---
  const cardDelays = [2 * fps, 3 * fps, 4 * fps].map(Math.round);
  const cardSprings = cardDelays.map((delay) =>
    spring({
      frame: Math.max(0, frame - delay),
      fps,
      config: { damping: 14, stiffness: 120 },
    })
  );
  const cardTranslateYs = cardSprings.map((s) =>
    interpolate(s, [0, 1], [40, 0])
  );
  const cardOpacities = cardSprings;

  // --- Checkmark draw progress per card ---
  const checkProgresses = cardDelays.map((delay) =>
    interpolate(frame, [delay + 6, delay + 0.8 * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // --- Break-even text fade in after cost counter finishes ---
  const breakEvenOpacity = interpolate(
    frame,
    [2 * fps, 2 * fps + 0.4 * fps],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        padding: 60,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Section Header */}
      <div style={{ opacity: headerOpacity, marginBottom: 40 }}>
        <p
          style={{
            fontFamily: monoFont,
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.gold,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
            marginBottom: 8,
          }}
        >
          WHY THIS MATTERS
        </p>
        <h2
          style={{
            fontFamily: interFont,
            fontSize: 36,
            fontWeight: 700,
            color: `${COLORS.white}e6`,
            margin: 0,
          }}
        >
          For Your AI Side Hustle
        </h2>
      </div>

      {/* Top Section: Left cost info + Right ROI counter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flex: 1,
        }}
      >
        {/* LEFT - Cost Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p
            style={{
              fontFamily: interFont,
              fontSize: 20,
              fontWeight: 400,
              color: COLORS.muted,
              margin: 0,
            }}
          >
            Monthly Cloud API Costs:
          </p>
          <p
            style={{
              fontFamily: monoFont,
              fontSize: 44,
              fontWeight: 700,
              color: COLORS.red,
              margin: 0,
            }}
          >
            ${costValue.toLocaleString()} - $1,000+
          </p>
          <p
            style={{
              fontFamily: interFont,
              fontSize: 20,
              fontWeight: 600,
              color: COLORS.green,
              margin: 0,
              opacity: breakEvenOpacity,
            }}
          >
            Break-Even: 3-5 months
          </p>
        </div>

        {/* RIGHT - ROI Counter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: roiOpacity,
          }}
        >
          <p
            style={{
              fontFamily: monoFont,
              fontSize: 64,
              fontWeight: 700,
              color: COLORS.gold,
              margin: 0,
              textShadow: `0 0 30px ${COLORS.gold}60`,
            }}
          >
            ${roiValue.toLocaleString()}+
          </p>
          <p
            style={{
              fontFamily: interFont,
              fontSize: 22,
              fontWeight: 400,
              color: COLORS.muted,
              margin: 0,
              marginTop: 4,
            }}
          >
            Saved Per Year
          </p>
          <p
            style={{
              fontFamily: interFont,
              fontSize: 18,
              fontWeight: 400,
              color: `${COLORS.white}66`,
              margin: 0,
              marginTop: 4,
            }}
          >
            Running Local AI
          </p>
        </div>
      </div>

      {/* BOTTOM - Use Case Cards */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
        }}
      >
        {USE_CASES.map((useCase, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.white}0d`,
              borderRadius: 16,
              padding: 24,
              opacity: cardOpacities[i],
              transform: `translateY(${cardTranslateYs[i]}px)`,
            }}
          >
            <div style={{ marginBottom: 14 }}>
              <Checkmark progress={checkProgresses[i]} />
            </div>
            <h3
              style={{
                fontFamily: interFont,
                fontSize: 22,
                fontWeight: 700,
                color: `${COLORS.white}e6`,
                margin: 0,
                marginBottom: 8,
              }}
            >
              {useCase.title}
            </h3>
            <p
              style={{
                fontFamily: interFont,
                fontSize: 16,
                fontWeight: 400,
                color: `${COLORS.white}80`,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {useCase.description}
            </p>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
