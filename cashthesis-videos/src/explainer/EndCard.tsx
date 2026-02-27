import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Scene recap icon
const SceneIcon: React.FC<{
  type: "bill" | "lightbulb" | "coin";
  delay: number;
}> = ({ type, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  const icons: Record<string, React.ReactNode> = {
    bill: (
      <svg width={60} height={36} viewBox="0 0 60 36">
        <rect x={2} y={2} width={56} height={32} rx={4} fill="#ec4899" opacity={0.8} />
        <text x={30} y={25} textAnchor="middle" fontSize={20} fontWeight="bold" fill="#fff" fontFamily="sans-serif">$</text>
      </svg>
    ),
    lightbulb: (
      <svg width={44} height={60} viewBox="0 0 44 60">
        <path d="M22 5 C12 5 4 15 4 24 C4 32 12 37 15 42 L29 42 C32 37 40 32 40 24 C40 15 32 5 22 5Z" fill="#fbbf24" opacity={0.9} />
        <rect x={15} y={42} width={14} height={4} rx={1} fill="#9ca3af" />
        <rect x={16} y={46} width={12} height={3} rx={1} fill="#6b7280" />
      </svg>
    ),
    coin: (
      <svg width={50} height={50} viewBox="0 0 50 50">
        <circle cx={25} cy={25} r={22} fill="#fbbf24" stroke="#f59e0b" strokeWidth={2.5} />
        <text x={25} y={32} textAnchor="middle" fontSize={20} fontWeight="bold" fill="#92400e" fontFamily="sans-serif">$</text>
      </svg>
    ),
  };

  return (
    <div
      style={{
        transform: `scale(${entrance})`,
        opacity: entrance,
      }}
    >
      {icons[type]}
    </div>
  );
};

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title entrance
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  // Subtitle
  const subtitleProgress = spring({
    frame: frame - Math.floor(0.5 * fps),
    fps,
    config: { damping: 200 },
    durationInFrames: Math.floor(1 * fps),
  });

  // Icons row
  const iconsDelay = Math.floor(1 * fps);

  // CTA pulse
  const ctaPulse = frame > 2 * fps
    ? 1 + 0.03 * Math.sin((frame - 2 * fps) * 0.1)
    : 0;

  const ctaOpacity = interpolate(
    frame,
    [2 * fps, 2.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 45%, #1a1040 0%, #0d1117 70%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: 0,
          right: 0,
          textAlign: "center",
          transform: `scale(${titleScale})`,
          opacity: titleScale,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#00e68a",
            letterSpacing: 2,
            fontFamily: "sans-serif",
          }}
        >
          CashThesis
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: 60,
          right: 60,
          textAlign: "center",
          opacity: subtitleProgress,
          transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "#ffffff",
            fontFamily: "sans-serif",
          }}
        >
          AI Content Factory
        </div>
      </div>

      {/* Scene icons row */}
      <div
        style={{
          position: "absolute",
          top: "54%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 50,
        }}
      >
        <SceneIcon type="bill" delay={iconsDelay} />
        <div style={{ color: "#444", fontSize: 24 }}>→</div>
        <SceneIcon type="lightbulb" delay={iconsDelay + 6} />
        <div style={{ color: "#444", fontSize: 24 }}>→</div>
        <SceneIcon type="coin" delay={iconsDelay + 12} />
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: "22%",
          left: 60,
          right: 60,
          textAlign: "center",
          opacity: ctaOpacity,
          transform: `scale(${ctaPulse || 1})`,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "sans-serif",
          }}
        >
          Follow{" "}
          <span style={{ color: "#00e68a" }}>@CashThesis</span>
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 22,
            color: "#888",
            fontFamily: "sans-serif",
          }}
        >
          Trends · Content · Money
        </div>
      </div>
    </AbsoluteFill>
  );
};
