import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "./constants";

export const GlitchTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Slide from right to left
  const slideProgress = interpolate(frame, [0, durationInFrames], [100, -100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glitch intensity peaks at midpoint
  const glitchIntensity = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Scanlines
  const scanlines: React.ReactNode[] = [];
  const scanlineCount = 8;
  for (let i = 0; i < scanlineCount; i++) {
    const offset = ((frame * 3 + i * 137) % 1920) - 100;
    const height = 4 + (i % 3) * 6;
    scanlines.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: offset,
          height,
          backgroundColor: COLORS.red,
          opacity: glitchIntensity * (0.3 + (i % 3) * 0.2),
        }}
      />
    );
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Main red slide */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${slideProgress}%`,
          width: "120%",
          backgroundColor: COLORS.red,
          opacity: glitchIntensity * 0.8,
        }}
      />
      {/* Scanlines */}
      {scanlines}
      {/* Flash overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.red,
          opacity: glitchIntensity * 0.15,
        }}
      />
    </AbsoluteFill>
  );
};
