import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { StickFigure } from "./StickFigure";

// Falling coin
const Coin: React.FC<{
  x: number;
  delay: number;
  size: number;
}> = ({ x, delay, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fallProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 80 },
    durationInFrames: Math.floor(2.5 * fps),
  });

  const y = interpolate(fallProgress, [0, 1], [-120, 750]);
  const rotation = interpolate(fallProgress, [0, 1], [0, 360 * (x % 2 === 0 ? 1 : -1)]);
  const opacity = interpolate(fallProgress, [0, 0.05, 0.7, 1], [0, 1, 1, 0.4]);

  // Slight bounce at bottom
  const bounceOffset =
    fallProgress > 0.85
      ? Math.sin((fallProgress - 0.85) * 40) * 15 * (1 - fallProgress)
      : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: 0,
        transform: `translateY(${y + bounceOffset}px) rotate(${rotation}deg)`,
        opacity,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 50 50">
        <circle cx={25} cy={25} r={23} fill="#fbbf24" stroke="#f59e0b" strokeWidth={3} />
        <circle cx={25} cy={25} r={16} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
        <text
          x={25}
          y={32}
          textAnchor="middle"
          fontSize={22}
          fontWeight="bold"
          fill="#92400e"
          fontFamily="sans-serif"
        >
          $
        </text>
      </svg>
    </div>
  );
};

// Floating dollar sign (rising upward)
const FloatingDollar: React.FC<{
  x: number;
  delay: number;
  size: number;
}> = ({ x, delay, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20 },
    durationInFrames: Math.floor(3 * fps),
  });

  const y = interpolate(progress, [0, 1], [600, -100]);
  const opacity = interpolate(progress, [0, 0.1, 0.6, 1], [0, 0.8, 0.6, 0]);
  const sway = Math.sin((frame - delay) * 0.06) * 20;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: 0,
        transform: `translateY(${y}px) translateX(${sway}px)`,
        opacity,
        fontSize: size,
        fontWeight: "bold",
        color: "#00e68a",
        fontFamily: "sans-serif",
      }}
    >
      $
    </div>
  );
};

// Coin data - staggered across screen
const COINS = [
  { x: 12, delay: 0, size: 44 },
  { x: 28, delay: 6, size: 38 },
  { x: 45, delay: 3, size: 48 },
  { x: 62, delay: 9, size: 36 },
  { x: 78, delay: 5, size: 42 },
  { x: 20, delay: 12, size: 34 },
  { x: 52, delay: 15, size: 46 },
  { x: 72, delay: 10, size: 40 },
  { x: 35, delay: 18, size: 38 },
  { x: 85, delay: 14, size: 44 },
  { x: 8, delay: 20, size: 36 },
  { x: 58, delay: 22, size: 42 },
  { x: 40, delay: 25, size: 34 },
  { x: 15, delay: 28, size: 40 },
  { x: 68, delay: 24, size: 38 },
];

// Rising dollar signs
const RISING_DOLLARS = [
  { x: 18, delay: 30, size: 32 },
  { x: 42, delay: 36, size: 28 },
  { x: 65, delay: 33, size: 36 },
  { x: 30, delay: 40, size: 24 },
  { x: 75, delay: 38, size: 30 },
  { x: 50, delay: 44, size: 34 },
  { x: 10, delay: 42, size: 26 },
  { x: 82, delay: 46, size: 32 },
];

export const MoneyGain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Figure entrance
  const figureEntrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  // Green glow pulse
  const glowIntensity = 0.15 + 0.1 * Math.sin(frame * 0.06);

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
          "radial-gradient(circle at 50% 40%, #0a2618 0%, #0d1117 70%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Green glow overlay */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          width: 500,
          height: 500,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0, 230, 138, ${glowIntensity}) 0%, transparent 70%)`,
        }}
      />

      {/* Falling coins */}
      {COINS.map((coin, i) => (
        <Coin key={`coin-${i}`} x={coin.x} delay={coin.delay} size={coin.size} />
      ))}

      {/* Rising dollar signs */}
      {RISING_DOLLARS.map((d, i) => (
        <FloatingDollar key={`dollar-${i}`} x={d.x} delay={d.delay} size={d.size} />
      ))}

      {/* Stick figure */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "38%",
          transform: `translateX(-50%) scale(${figureEntrance})`,
          opacity: figureEntrance,
        }}
      >
        <StickFigure pose="catching" size={280} color="#ffffff" />
      </div>

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
          Now the money comes
          <br />
          to <span style={{ color: "#00e68a" }}>YOU</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
