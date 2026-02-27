import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { MoneyLoss } from "./MoneyLoss";
import { Discovery } from "./Discovery";
import { MoneyGain } from "./MoneyGain";
import { EndCard } from "./EndCard";

export const ExplainerVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d1117" }}>
      {/* Scene 1: Money Loss / Confusion (0-13s) */}
      <Sequence from={0} durationInFrames={Math.floor(13 * fps)}>
        <MoneyLoss />
      </Sequence>

      {/* Scene 2: AI Discovery (13-27s) */}
      <Sequence from={Math.floor(13 * fps)} durationInFrames={Math.floor(14 * fps)}>
        <Discovery />
      </Sequence>

      {/* Scene 3: Money Flowing In (27-40s) */}
      <Sequence from={Math.floor(27 * fps)} durationInFrames={Math.floor(13 * fps)}>
        <MoneyGain />
      </Sequence>

      {/* End Card (40-45s) */}
      <Sequence from={Math.floor(40 * fps)} durationInFrames={Math.floor(5 * fps)}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};
