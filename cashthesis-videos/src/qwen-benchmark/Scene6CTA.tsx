import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, interFont, monoFont } from "./constants";

const FLOATING_PILLS = [
  { label: "Hybrid Architecture", x: 120, y: 140, phase: 0 },
  { label: "Sparse MoE", x: 1520, y: 200, phase: 1.2 },
  { label: "Multimodal AI", x: 280, y: 820, phase: 2.4 },
  { label: "Zero API Costs", x: 1400, y: 760, phase: 3.6 },
  { label: "Local Inference", x: 800, y: 920, phase: 4.8 },
];

export const Scene6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Accent bar: spring sweep left→right ---
  const barSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 160 },
    durationInFrames: Math.round(0.5 * fps),
  });
  const barTranslateX = interpolate(barSpring, [0, 1], [-100, 0]);

  // --- CTA text: fade in + scale spring with 0.3s delay ---
  const ctaDelay = Math.round(0.3 * fps);
  const ctaSpring = spring({
    frame: Math.max(0, frame - ctaDelay),
    fps,
    config: { damping: 14, stiffness: 160 },
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.8, 1]);
  const ctaOpacity = ctaSpring;

  // --- Stats line: fade in 1s after CTA (so ~1.3s from start) ---
  const statsDelay = Math.round(1.3 * fps);
  const statsOpacity = interpolate(
    frame,
    [statsDelay, statsDelay + fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // --- Subscribe button: spring in at 1.5s, then pulse ---
  const subDelay = Math.round(1.5 * fps);
  const subSpring = spring({
    frame: Math.max(0, frame - subDelay),
    fps,
    config: { damping: 12, stiffness: 140 },
  });
  const subOpacity = subSpring;
  const pulseScale =
    frame > subDelay
      ? 1 + 0.03 * Math.sin((frame - subDelay) * 0.1)
      : 0.97;
  const subScale = interpolate(subSpring, [0, 1], [0.5, 1]) * pulseScale;

  // --- Subscribe text below CTA ---
  const subscribeTextOpacity = interpolate(
    frame,
    [statsDelay, statsDelay + Math.round(0.5 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // --- Branding: fade in at 2s ---
  const brandDelay = Math.round(2 * fps);
  const brandOpacity = interpolate(
    frame,
    [brandDelay, brandDelay + Math.round(0.5 * fps)],
    [0, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, rgba(0,230,138,0.04) 0%, ${COLORS.bg} 70%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Floating pills background */}
      {FLOATING_PILLS.map((pill) => {
        const yOffset = Math.sin(frame * 0.05 + pill.phase) * 8;
        return (
          <div
            key={pill.label}
            style={{
              position: "absolute",
              left: pill.x,
              top: pill.y,
              transform: `translateY(${yOffset}px)`,
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.white}0D`,
              borderRadius: 9999,
              padding: "8px 16px",
              fontFamily: monoFont,
              fontSize: 12,
              color: `${COLORS.white}26`,
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            {pill.label}
          </div>
        );
      })}

      {/* Center CTA block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          zIndex: 1,
        }}
      >
        {/* Green accent bar */}
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            height: 4,
            backgroundColor: COLORS.green,
            borderRadius: 2,
            transform: `translateX(${barTranslateX}%)`,
            marginBottom: 32,
            boxShadow: `0 0 20px ${COLORS.green}60`,
          }}
        />

        {/* Main CTA text */}
        <div
          style={{
            transform: `scale(${ctaScale})`,
            opacity: ctaOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <p
            style={{
              fontFamily: interFont,
              fontSize: 42,
              fontWeight: 700,
              color: `${COLORS.white}E6`,
              margin: 0,
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            THE SETUP IS READY.
          </p>
          <p
            style={{
              fontFamily: interFont,
              fontSize: 42,
              fontWeight: 700,
              color: COLORS.green,
              margin: 0,
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            YOUR AI SIDE HUSTLE STARTS NOW.
          </p>
        </div>

        {/* Stats line */}
        <p
          style={{
            fontFamily: monoFont,
            fontSize: 22,
            fontWeight: 400,
            color: COLORS.muted,
            margin: 0,
            marginTop: 24,
            textAlign: "center",
            opacity: statsOpacity,
          }}
        >
          Qwen3.5 35B-A3B · 45 t/s · 262K Context · $0/month
        </p>

        {/* Subscribe text */}
        <p
          style={{
            fontFamily: interFont,
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.gold,
            margin: 0,
            marginTop: 20,
            textAlign: "center",
            opacity: subscribeTextOpacity,
          }}
        >
          SUBSCRIBE FOR MORE AI MONEY SETUPS
        </p>

        {/* Subscribe button */}
        <div
          style={{
            marginTop: 28,
            transform: `scale(${subScale})`,
            opacity: subOpacity,
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.gold,
              borderRadius: 9999,
              padding: "14px 48px",
              boxShadow: `0 0 30px ${COLORS.gold}60, 0 0 60px ${COLORS.gold}30`,
            }}
          >
            <span
              style={{
                fontFamily: interFont,
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.bg,
              }}
            >
              SUBSCRIBE
            </span>
          </div>
        </div>
      </div>

      {/* Bottom branding - watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          right: 48,
          opacity: brandOpacity,
        }}
      >
        <span
          style={{
            fontFamily: interFont,
            fontSize: 18,
            fontWeight: 600,
            color: COLORS.green,
          }}
        >
          CashThesis
        </span>
      </div>

      {/* Bottom branding - next video teaser */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: brandOpacity,
        }}
      >
        <span
          style={{
            fontFamily: interFont,
            fontSize: 16,
            fontWeight: 400,
            color: COLORS.muted,
          }}
        >
          Next: Qwen3.5 122B — The Unified Memory Model
        </span>
      </div>
    </AbsoluteFill>
  );
};
