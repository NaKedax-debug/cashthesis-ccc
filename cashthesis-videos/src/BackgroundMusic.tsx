import React from "react";
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useVideoConfig } from "remotion";

type BackgroundMusicProps = {
  /** File in public/ folder, e.g. "audio/bg-music.mp3" */
  src?: string;
  /** Remote URL — used if src is not provided */
  remoteSrc?: string;
  /** Peak volume (0–1). Default: 0.15 */
  volume?: number;
  /** Fade-in duration in seconds. Default: 1 */
  fadeInSec?: number;
  /** Fade-out duration in seconds. Default: 2 */
  fadeOutSec?: number;
};

/**
 * Looping background music with fade-in / fade-out.
 *
 * Usage:
 *   <BackgroundMusic src="audio/bg-music.mp3" />
 *   <BackgroundMusic remoteSrc="https://example.com/track.mp3" volume={0.1} />
 *
 * Place music files in the public/ folder and reference with `src`.
 * The component loops indefinitely, fades in at start, and fades out
 * before the composition ends.
 */
export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src,
  remoteSrc,
  volume = 0.15,
  fadeInSec = 1,
  fadeOutSec = 2,
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  const audioSrc = src ? staticFile(src) : remoteSrc;
  if (!audioSrc) return null;

  const fadeInFrames = Math.floor(fadeInSec * fps);
  const fadeOutFrames = Math.floor(fadeOutSec * fps);

  const volumeCallback = (f: number) => {
    // Fade in
    const fadeIn = interpolate(f, [0, fadeInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Fade out — f is the frame relative to when audio starts (0-based)
    // Since the Audio starts at frame 0 of the composition, f maps 1:1
    const fadeOut = interpolate(
      f,
      [durationInFrames - fadeOutFrames, durationInFrames],
      [1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    return Math.min(fadeIn, fadeOut) * volume;
  };

  return (
    <Audio
      src={audioSrc}
      loop
      loopVolumeCurveBehavior="extend"
      volume={volumeCallback}
    />
  );
};
