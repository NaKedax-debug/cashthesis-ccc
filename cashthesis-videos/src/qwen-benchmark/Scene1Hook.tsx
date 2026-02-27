import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, interFont, monoFont } from "./constants";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Title animation: spring from top ---
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 180 },
  });
  const titleTranslateY = interpolate(titleSpring, [0, 1], [-80, 0]);
  const titleOpacity = titleSpring;

  // --- Gold subtitle: spring with 0.5s delay ---
  const goldDelay = Math.round(0.5 * fps); // 12 frames
  const goldSpring = spring({
    frame: Math.max(0, frame - goldDelay),
    fps,
    config: { damping: 15, stiffness: 180 },
  });
  const goldTranslateY = interpolate(goldSpring, [0, 1], [60, 0]);
  const goldOpacity = goldSpring;

  // --- Subtitle text: fade in from 1s to 2s ---
  const subtitleOpacity = interpolate(
    frame,
    [1 * fps, 2 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // --- Specs badge: spring with 1.5s delay, slide from right ---
  const badgeDelay = Math.round(1.5 * fps); // 36 frames
  const badgeSpring = spring({
    frame: Math.max(0, frame - badgeDelay),
    fps,
    config: { damping: 15, stiffness: 180 },
  });
  const badgeTranslateX = interpolate(badgeSpring, [0, 1], [400, 0]);
  const badgeOpacity = badgeSpring;

  const specItems = [
    "35B Parameters | 3B Active",
    "262K Context Window",
    "Multimodal Vision + Text",
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Title */}
      <Sequence from={0} layout="none" premountFor={fps}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `translateY(${titleTranslateY}px)`,
            opacity: titleOpacity,
          }}
        >
          <h1
            style={{
              fontFamily: monoFont,
              fontSize: 72,
              fontWeight: 700,
              color: COLORS.green,
              textShadow: `0 0 40px ${COLORS.green}80, 0 0 80px ${COLORS.green}40, 0 0 120px ${COLORS.green}20`,
              margin: 0,
              lineHeight: 1.2,
              textAlign: "center",
            }}
          >
            Qwen3.5 35B-A3B
          </h1>
        </div>
      </Sequence>

      {/* Gold subtitle */}
      <Sequence from={0} layout="none" premountFor={fps}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            marginTop: 30,
            transform: `translateY(${goldTranslateY}px)`,
            opacity: goldOpacity,
          }}
        >
          <p
            style={{
              fontFamily: interFont,
              fontSize: 48,
              fontWeight: 700,
              color: COLORS.gold,
              margin: 0,
              textAlign: "center",
            }}
          >
            45 t/s on Single 16GB GPU
          </p>
        </div>
      </Sequence>

      {/* Subtitle text */}
      <Sequence from={0} layout="none" premountFor={fps}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            marginTop: 110,
            opacity: subtitleOpacity,
          }}
        >
          <p
            style={{
              fontFamily: interFont,
              fontSize: 28,
              fontWeight: 400,
              color: `${COLORS.white}99`,
              margin: 0,
              textAlign: "center",
            }}
          >
            The AI Side Hustle Setup You've Been Waiting For
          </p>
        </div>
      </Sequence>

      {/* Specs badge - bottom right */}
      <Sequence from={0} layout="none" premountFor={fps}>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 48,
            transform: `translateX(${badgeTranslateX}px)`,
            opacity: badgeOpacity,
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            padding: "24px 32px",
            border: `1px solid ${COLORS.white}15`,
            boxShadow: `0 8px 32px ${COLORS.bg}cc`,
          }}
        >
          {specItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: i < specItems.length - 1 ? 14 : 0,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: COLORS.green,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: interFont,
                  fontSize: 20,
                  fontWeight: 600,
                  color: `${COLORS.white}cc`,
                  whiteSpace: "nowrap",
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
