import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { StickFigure } from "./StickFigure";

// Orbiting icon
const OrbitIcon: React.FC<{
  emoji: string;
  index: number;
  total: number;
  radius: number;
}> = ({ emoji, index, total, radius }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - Math.floor(1.5 * fps) - index * 8,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  const baseAngle = (index / total) * Math.PI * 2;
  const rotation = baseAngle + (frame * 0.015);
  const x = Math.cos(rotation) * radius * entrance;
  const y = Math.sin(rotation) * radius * 0.5 * entrance; // elliptical

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "38%",
        transform: `translate(${x}px, ${y}px) scale(${entrance})`,
        fontSize: 40,
        opacity: entrance,
      }}
    >
      {emoji}
    </div>
  );
};

// SVG Lightbulb
const Lightbulb: React.FC<{ glowIntensity: number }> = ({ glowIntensity }) => {
  return (
    <svg width={160} height={220} viewBox="0 0 160 220">
      {/* Glow */}
      <defs>
        <radialGradient id="bulbGlow" cx="50%" cy="40%" r="50%">
          <stop
            offset="0%"
            stopColor="#fbbf24"
            stopOpacity={0.4 * glowIntensity}
          />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={80} cy={85} r={75} fill="url(#bulbGlow)" />

      {/* Bulb glass */}
      <path
        d="M80 20 C45 20 25 50 25 80 C25 105 45 120 55 135 L105 135 C115 120 135 105 135 80 C135 50 115 20 80 20Z"
        fill="#fbbf24"
        opacity={0.9}
      />

      {/* Filament */}
      <path
        d="M65 90 Q72 70 80 90 Q88 70 95 90"
        fill="none"
        stroke="#f59e0b"
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Base */}
      <rect x={55} y={135} width={50} height={8} rx={2} fill="#9ca3af" />
      <rect x={58} y={143} width={44} height={6} rx={2} fill="#6b7280" />
      <rect x={58} y={149} width={44} height={6} rx={2} fill="#9ca3af" />
      <path
        d="M62 155 Q80 170 98 155"
        fill="none"
        stroke="#6b7280"
        strokeWidth={4}
        strokeLinecap="round"
      />

      {/* Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const innerR = 78;
        const outerR = 95;
        const x1 = 80 + Math.cos(rad) * innerR;
        const y1 = 80 + Math.sin(rad) * innerR;
        const x2 = 80 + Math.cos(rad) * outerR;
        const y2 = 80 + Math.sin(rad) * outerR;
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#fbbf24"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.6 * glowIntensity}
          />
        );
      })}
    </svg>
  );
};

const ORBIT_ITEMS = ["🤖", "📈", "💰", "⚡", "🧠"];

export const Discovery: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Figure entrance
  const figureEntrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  // Lightbulb entrance at 0.8s
  const bulbScale = spring({
    frame: frame - Math.floor(0.8 * fps),
    fps,
    config: { damping: 8 },
  });

  // Glow pulse
  const glowPulse =
    0.7 + 0.3 * Math.sin((frame - 1 * fps) * 0.08);

  // Text at 3s
  const textProgress = spring({
    frame: frame - Math.floor(3 * fps),
    fps,
    config: { damping: 200 },
    durationInFrames: Math.floor(1 * fps),
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 35%, #1a1040 0%, #0d1117 70%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Stick figure */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          transform: `translateX(-50%) scale(${figureEntrance})`,
          opacity: figureEntrance,
        }}
      >
        <StickFigure pose="excited" size={250} color="#ffffff" />
      </div>

      {/* Lightbulb */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "12%",
          transform: `translateX(-50%) scale(${bulbScale})`,
          opacity: bulbScale,
        }}
      >
        <Lightbulb glowIntensity={glowPulse} />
      </div>

      {/* Orbiting icons */}
      {ORBIT_ITEMS.map((emoji, i) => (
        <OrbitIcon
          key={i}
          emoji={emoji}
          index={i}
          total={ORBIT_ITEMS.length}
          radius={180}
        />
      ))}

      {/* Text */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: 60,
          right: 60,
          textAlign: "center",
          opacity: textProgress,
          transform: `translateY(${interpolate(textProgress, [0, 1], [30, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.3,
          }}
        >
          <span style={{ color: "#a855f7" }}>AI tools</span> changed
          <br />
          everything
        </div>
      </div>
    </AbsoluteFill>
  );
};
