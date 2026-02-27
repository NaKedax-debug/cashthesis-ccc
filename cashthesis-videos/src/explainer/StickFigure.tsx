import React from "react";

type Pose = "confused" | "excited" | "catching";

export const StickFigure: React.FC<{
  pose: Pose;
  size?: number;
  color?: string;
}> = ({ pose, size = 300, color = "#ffffff" }) => {
  const s = size;
  const cx = s / 2;

  // Head
  const headR = s * 0.1;
  const headY = s * 0.18;

  // Body
  const bodyTop = headY + headR + 4;
  const bodyBot = s * 0.55;

  // Arms
  const armY = bodyTop + (bodyBot - bodyTop) * 0.25;

  // Legs
  const legBot = s * 0.88;

  const armProps = (() => {
    switch (pose) {
      case "confused":
        // One arm up (scratching head), one down
        return {
          leftArm: `M ${cx} ${armY} L ${cx - s * 0.18} ${armY + s * 0.15}`,
          rightArm: `M ${cx} ${armY} L ${cx + s * 0.12} ${headY - s * 0.02}`,
        };
      case "excited":
        // Both arms up in V shape
        return {
          leftArm: `M ${cx} ${armY} L ${cx - s * 0.18} ${headY - s * 0.08}`,
          rightArm: `M ${cx} ${armY} L ${cx + s * 0.18} ${headY - s * 0.08}`,
        };
      case "catching":
        // Arms out wide, hands cupped
        return {
          leftArm: `M ${cx} ${armY} L ${cx - s * 0.22} ${armY - s * 0.05}`,
          rightArm: `M ${cx} ${armY} L ${cx + s * 0.22} ${armY - s * 0.05}`,
        };
    }
  })();

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Head */}
      <circle
        cx={cx}
        cy={headY}
        r={headR}
        fill="none"
        stroke={color}
        strokeWidth={4}
      />

      {/* Eyes */}
      <circle cx={cx - headR * 0.35} cy={headY - headR * 0.1} r={3} fill={color} />
      <circle cx={cx + headR * 0.35} cy={headY - headR * 0.1} r={3} fill={color} />

      {/* Mouth — depends on pose */}
      {pose === "confused" && (
        <path
          d={`M ${cx - 8} ${headY + headR * 0.4} Q ${cx} ${headY + headR * 0.3} ${cx + 8} ${headY + headR * 0.5}`}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      )}
      {pose === "excited" && (
        <path
          d={`M ${cx - 10} ${headY + headR * 0.25} Q ${cx} ${headY + headR * 0.6} ${cx + 10} ${headY + headR * 0.25}`}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      )}
      {pose === "catching" && (
        <ellipse
          cx={cx}
          cy={headY + headR * 0.35}
          rx={7}
          ry={5}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
        />
      )}

      {/* Body */}
      <line
        x1={cx}
        y1={bodyTop}
        x2={cx}
        y2={bodyBot}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />

      {/* Arms */}
      <path
        d={armProps.leftArm}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d={armProps.rightArm}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />

      {/* Legs */}
      <line
        x1={cx}
        y1={bodyBot}
        x2={cx - s * 0.12}
        y2={legBot}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={bodyBot}
        x2={cx + s * 0.12}
        y2={legBot}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />

      {/* Pose-specific extras */}
      {pose === "confused" && (
        <>
          {/* Question mark above head */}
          <text
            x={cx + headR + 8}
            y={headY - headR - 5}
            fontSize={28}
            fill="#ec4899"
            fontFamily="sans-serif"
            fontWeight="bold"
          >
            ?
          </text>
        </>
      )}
    </svg>
  );
};
