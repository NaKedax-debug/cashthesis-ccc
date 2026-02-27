import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

export const IntroVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Title: fade in from 0.5s to 2.5s ---
  const titleOpacity = interpolate(
    frame,
    [0.5 * fps, 2.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // --- Title: pulse animation after 2.5s ---
  // Oscillates scale between 1.0 and 1.03 with a ~2s cycle
  const pulsePhase = (frame - 2.5 * fps) / fps;
  const pulseScale = frame >= 2.5 * fps
    ? 1 + 0.03 * Math.sin(pulsePhase * Math.PI)
    : 1;

  // --- Subtitle: slide up + fade in from 3s to 4.5s ---
  const subtitleProgress = spring({
    frame: frame - 3 * fps,
    fps,
    config: { damping: 200 },
    durationInFrames: 1.5 * fps,
  });

  const subtitleOpacity = subtitleProgress;
  const subtitleTranslateY = interpolate(subtitleProgress, [0, 1], [50, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0f",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Title */}
      <Sequence from={0} premountFor={fps}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "#00e68a",
              fontSize: 72,
              fontWeight: 700,
              fontFamily: "Outfit, sans-serif",
              opacity: titleOpacity,
              transform: `scale(${pulseScale})`,
              textAlign: "center",
              marginTop: -40,
            }}
          >
            CashThesis - AI Content Factory
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Subtitle */}
      <Sequence from={Math.floor(3 * fps)} premountFor={fps}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: 36,
              fontWeight: 400,
              fontFamily: "Outfit, sans-serif",
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleTranslateY}px)`,
              textAlign: "center",
              marginTop: 60,
            }}
          >
            Find Trends. Create Content. Make Money.
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
