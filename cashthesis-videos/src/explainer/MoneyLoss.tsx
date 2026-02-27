import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { StickFigure } from "./StickFigure";

// Flying dollar bills
const BILLS = [
  { angle: -40, delay: 0 },
  { angle: -70, delay: 5 },
  { angle: 20, delay: 10 },
  { angle: 60, delay: 8 },
  { angle: -15, delay: 15 },
  { angle: 80, delay: 12 },
];

const DollarBill: React.FC<{
  angleDeg: number;
  delay: number;
}> = ({ angleDeg, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 8 },
    durationInFrames: Math.floor(2 * fps),
  });

  const rad = (angleDeg * Math.PI) / 180;
  const distance = progress * 350;
  const x = Math.cos(rad) * distance;
  const y = Math.sin(rad) * distance - progress * 100;
  const rotation = progress * angleDeg * 2;
  const opacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.3]);
  const scale = interpolate(progress, [0, 0.3, 1], [0.3, 1.2, 0.6]);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "45%",
        transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
        opacity,
      }}
    >
      <svg width={70} height={40} viewBox="0 0 70 40">
        <rect
          x={2}
          y={2}
          width={66}
          height={36}
          rx={4}
          fill="#00e68a"
          stroke="#00c975"
          strokeWidth={2}
        />
        <text
          x={35}
          y={27}
          textAnchor="middle"
          fontSize={24}
          fontWeight="bold"
          fill="#0d1117"
          fontFamily="sans-serif"
        >
          $
        </text>
      </svg>
    </div>
  );
};

// Bouncing question marks
const QuestionMark: React.FC<{
  x: number;
  delay: number;
  size: number;
}> = ({ x, delay, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bounce = spring({
    frame: frame - delay,
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  const y = interpolate(bounce, [0, 1], [0, -40]);

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: "28%",
        transform: `translateY(${y}px) scale(${bounce})`,
        fontSize: size,
        fontWeight: "bold",
        color: "#ec4899",
        fontFamily: "sans-serif",
      }}
    >
      ?
    </div>
  );
};

export const MoneyLoss: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Figure fades in
  const figureOpacity = interpolate(
    frame,
    [0, 0.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Text fades in at 2s
  const textProgress = spring({
    frame: frame - 2 * fps,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.floor(1 * fps),
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #1a1030 0%, #0d1117 70%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Stick figure */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "32%",
          transform: "translateX(-50%)",
          opacity: figureOpacity,
        }}
      >
        <StickFigure pose="confused" size={280} color="#ffffff" />
      </div>

      {/* Flying bills */}
      {BILLS.map((bill, i) => (
        <DollarBill key={i} angleDeg={bill.angle} delay={Math.floor(0.8 * fps) + bill.delay} />
      ))}

      {/* Question marks */}
      <QuestionMark x={38} delay={Math.floor(0.5 * fps)} size={48} />
      <QuestionMark x={56} delay={Math.floor(0.8 * fps)} size={36} />
      <QuestionMark x={47} delay={Math.floor(1.2 * fps)} size={56} />

      {/* Text */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
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
          Struggling to make
          <br />
          money online<span style={{ color: "#ec4899" }}>?</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
