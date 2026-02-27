import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, interFont, monoFont } from "./constants";

// --- Terminal line definitions ---
const TERMINAL_LINES: Array<{
  text: string;
  color: string;
  prefix?: { text: string; color: string };
  bold?: boolean;
  isProgressBar?: boolean;
}> = [
  {
    text: "ollama pull qwen3.5:35b-a3b",
    color: COLORS.white,
    prefix: { text: "$ ", color: COLORS.green },
  },
  { text: "> Pulling model...", color: COLORS.muted },
  { text: "> [________________] 0%", color: COLORS.white, isProgressBar: true },
  { text: "> Model loaded: 262,144 ctx", color: COLORS.green },
  { text: "> Inference: 45 t/s", color: COLORS.gold, bold: true },
];

// Characters per frame for typewriter
const CHARS_PER_FRAME = 0.6;

// Calculate when each line starts typing (in frames)
function getLineTimings() {
  const timings: Array<{ startFrame: number; charCount: number }> = [];
  let currentFrame = 0;

  for (let i = 0; i < TERMINAL_LINES.length; i++) {
    const line = TERMINAL_LINES[i];
    const fullText = (line.prefix?.text || "") + line.text;
    const charCount = fullText.length;

    if (i === 2) {
      // Progress bar line appears after line 1 finishes + 1s gap (24 frames)
      timings.push({ startFrame: currentFrame, charCount: 4 }); // Just "> [" prefix
    } else if (i === 3) {
      // Line 3 appears after progress bar finishes (~1.5s after line 2 start)
      const prevStart = timings[2].startFrame;
      currentFrame = prevStart + 36 + 6; // progress bar duration + small gap
      timings.push({ startFrame: currentFrame, charCount: charCount });
    } else {
      timings.push({ startFrame: currentFrame, charCount: charCount });
    }

    if (i !== 2) {
      const typeDuration = Math.ceil(charCount / CHARS_PER_FRAME);
      currentFrame += typeDuration + 6; // small gap between lines
    } else {
      // Progress bar: prefix types then bar animates
      currentFrame += Math.ceil(4 / CHARS_PER_FRAME) + 6;
    }
  }

  return timings;
}

const LINE_TIMINGS = getLineTimings();

// --- Setup steps data ---
const SETUP_STEPS = [
  {
    number: 1,
    title: "Download Ollama",
    subtitle: "Install Qwen3.5 35B-A3B model",
    checkFrame: 4 * 24, // 4 seconds
  },
  {
    number: 2,
    title: "Allocate GPU Memory",
    subtitle: "Hybrid arch = efficient VRAM",
    checkFrame: 6 * 24, // 6 seconds
  },
  {
    number: 3,
    title: "Run Local Server",
    subtitle: "45 t/s inference, connect to apps",
    checkFrame: 8 * 24, // 8 seconds
  },
];

// --- Specs widget rows ---
const SPEC_ROWS = [
  { label: "GPU: RTX 5060 (16GB)", type: "text" as const },
  { label: "VRAM: 14.2 / 16.0 GB", type: "bar" as const, fillPercent: 89 },
  { label: "Temp: 62\u00B0C", type: "green" as const },
  { label: "Speed: 45 t/s \u2713", type: "gold" as const },
];

// --- Checkmark SVG component ---
const AnimatedCheckmark: React.FC<{
  progress: number;
  size?: number;
}> = ({ progress, size = 18 }) => {
  const totalLength = 24;
  const dashOffset = interpolate(progress, [0, 1], [totalLength, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <polyline
        points="4,12 10,18 20,6"
        stroke={COLORS.green}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );
};

// --- Progress bar renderer ---
const ProgressBar: React.FC<{ frame: number; startFrame: number }> = ({
  frame,
  startFrame,
}) => {
  const barWidth = 16; // number of block characters
  const animDuration = 36; // 1.5 seconds at 24fps
  const localFrame = frame - startFrame;

  const fillCount = Math.round(
    interpolate(localFrame, [6, 6 + animDuration], [0, barWidth], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const percentage = Math.round(
    interpolate(localFrame, [6, 6 + animDuration], [0, 100], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const filled = "\u2588".repeat(fillCount);
  const empty = "\u2591".repeat(barWidth - fillCount);

  // Typewriter for the prefix "> ["
  const prefixText = "> [";
  const prefixChars = Math.floor(
    Math.min(localFrame * CHARS_PER_FRAME, prefixText.length)
  );
  const visiblePrefix = prefixText.slice(0, prefixChars);

  if (localFrame < 0) return null;

  // Show prefix first, then bar once prefix is typed
  const showBar = prefixChars >= prefixText.length;

  return (
    <div
      style={{
        fontFamily: monoFont,
        fontSize: 16,
        lineHeight: 1.8,
        color: COLORS.white,
        whiteSpace: "pre",
      }}
    >
      {visiblePrefix}
      {showBar && (
        <>
          <span style={{ color: COLORS.green }}>{filled}</span>
          <span style={{ color: `${COLORS.white}30` }}>{empty}</span>
          {`] ${percentage}%`}
        </>
      )}
    </div>
  );
};

export const Scene5Setup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Terminal window fade in ---
  const terminalOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Specs widget: row stagger fade in ---
  const specsStartFrame = Math.round(1 * fps); // starts at 1s
  const specsStagger = Math.round(0.5 * fps); // 0.5s between rows

  // --- Steps: fade in sequentially ---
  const stepsStartFrame = Math.round(2.5 * fps);
  const stepStagger = Math.round(1.5 * fps);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        padding: 48,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top section: Terminal (left) + Specs (right) */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: 32,
          minHeight: 0,
        }}
      >
        {/* CENTER-LEFT: Terminal Window */}
        <div
          style={{
            flex: "0 0 60%",
            opacity: terminalOpacity,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Window chrome */}
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              border: `1px solid ${COLORS.white}1a`,
              borderBottom: "none",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* Traffic light dots */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: COLORS.red,
              }}
            />
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: COLORS.gold,
              }}
            />
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: COLORS.green,
              }}
            />
            <span
              style={{
                fontFamily: monoFont,
                fontSize: 12,
                color: COLORS.muted,
                marginLeft: 12,
              }}
            >
              Terminal
            </span>
          </div>

          {/* Terminal body */}
          <div
            style={{
              backgroundColor: COLORS.bg,
              border: `1px solid ${COLORS.white}1a`,
              borderTop: `1px solid ${COLORS.white}0d`,
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              padding: "20px 24px",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {TERMINAL_LINES.map((line, i) => {
              const timing = LINE_TIMINGS[i];
              const localFrame = frame - timing.startFrame;

              if (localFrame < 0) return null;

              // Progress bar line gets special rendering
              if (line.isProgressBar) {
                return (
                  <ProgressBar
                    key={i}
                    frame={frame}
                    startFrame={timing.startFrame}
                  />
                );
              }

              // Regular typewriter line
              const fullText = (line.prefix?.text || "") + line.text;
              const visibleChars = Math.floor(
                Math.min(localFrame * CHARS_PER_FRAME, fullText.length)
              );
              const visibleText = fullText.slice(0, visibleChars);

              // Split back into prefix and main text
              const prefixLen = line.prefix?.text.length || 0;
              const visiblePrefix = visibleText.slice(
                0,
                Math.min(prefixLen, visibleChars)
              );
              const visibleMain = visibleText.slice(prefixLen);

              // Blinking cursor at the end while typing
              const isTyping = visibleChars < fullText.length;
              const cursorVisible = isTyping && Math.floor(frame / 8) % 2 === 0;

              return (
                <div
                  key={i}
                  style={{
                    fontFamily: monoFont,
                    fontSize: 16,
                    lineHeight: 1.8,
                    whiteSpace: "pre",
                  }}
                >
                  {line.prefix && (
                    <span style={{ color: line.prefix.color }}>
                      {visiblePrefix}
                    </span>
                  )}
                  <span
                    style={{
                      color: line.color,
                      fontWeight: line.bold ? 700 : 400,
                    }}
                  >
                    {visibleMain}
                  </span>
                  {cursorVisible && (
                    <span style={{ color: COLORS.green }}>|</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TOP-RIGHT: System Specs Widget */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              border: `1px solid ${COLORS.white}1a`,
              padding: "28px 32px",
            }}
          >
            <div
              style={{
                fontFamily: interFont,
                fontSize: 14,
                fontWeight: 600,
                color: COLORS.muted,
                textTransform: "uppercase" as const,
                letterSpacing: 2,
                marginBottom: 20,
              }}
            >
              System Monitor
            </div>

            {SPEC_ROWS.map((row, i) => {
              const rowStartFrame = specsStartFrame + i * specsStagger;
              const rowOpacity = interpolate(
                frame,
                [rowStartFrame, rowStartFrame + Math.round(0.4 * fps)],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              const rowTranslateY = interpolate(
                frame,
                [rowStartFrame, rowStartFrame + Math.round(0.4 * fps)],
                [12, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );

              const textColor =
                row.type === "green"
                  ? COLORS.green
                  : row.type === "gold"
                    ? COLORS.gold
                    : `${COLORS.white}b3`;

              // VRAM bar fill animation
              const vramFill =
                row.type === "bar"
                  ? interpolate(
                      frame,
                      [
                        rowStartFrame + Math.round(0.4 * fps),
                        rowStartFrame + Math.round(1.5 * fps),
                      ],
                      [0, row.fillPercent],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    )
                  : 0;

              return (
                <div
                  key={i}
                  style={{
                    opacity: rowOpacity,
                    transform: `translateY(${rowTranslateY}px)`,
                    marginBottom: i < SPEC_ROWS.length - 1 ? 18 : 0,
                  }}
                >
                  <div
                    style={{
                      fontFamily: monoFont,
                      fontSize: 17,
                      fontWeight: 400,
                      color: textColor,
                      marginBottom: row.type === "bar" ? 8 : 0,
                    }}
                  >
                    {row.label}
                  </div>

                  {/* VRAM bar */}
                  {row.type === "bar" && (
                    <div
                      style={{
                        width: "100%",
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${COLORS.white}15`,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${vramFill}%`,
                          height: "100%",
                          borderRadius: 4,
                          backgroundColor: COLORS.green,
                          boxShadow: `0 0 8px ${COLORS.green}60`,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM: 3 Setup Steps */}
      <div
        style={{
          display: "flex",
          gap: 32,
          marginTop: 32,
        }}
      >
        {SETUP_STEPS.map((step, i) => {
          const stepStart = stepsStartFrame + i * stepStagger;
          const stepOpacity = interpolate(
            frame,
            [stepStart, stepStart + Math.round(0.5 * fps)],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const stepTranslateY = interpolate(
            frame,
            [stepStart, stepStart + Math.round(0.5 * fps)],
            [20, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Checkmark draw animation using spring
          const checkProgress = spring({
            frame: Math.max(0, frame - step.checkFrame),
            fps,
            config: { damping: 15, stiffness: 120 },
          });

          return (
            <div
              key={i}
              style={{
                flex: 1,
                opacity: stepOpacity,
                transform: `translateY(${stepTranslateY}px)`,
                backgroundColor: COLORS.surface,
                borderRadius: 12,
                border: `1px solid ${COLORS.white}15`,
                padding: "20px 24px",
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              {/* Numbered circle */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `2px solid ${COLORS.green}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: interFont,
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.green,
                  }}
                >
                  {step.number}
                </span>
              </div>

              {/* Step text */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: interFont,
                    fontSize: 18,
                    fontWeight: 700,
                    color: COLORS.white,
                    marginBottom: 4,
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontFamily: interFont,
                    fontSize: 14,
                    fontWeight: 400,
                    color: COLORS.muted,
                  }}
                >
                  {step.subtitle}
                </div>
              </div>

              {/* Animated checkmark */}
              <div
                style={{
                  flexShrink: 0,
                  marginTop: 4,
                  opacity: interpolate(checkProgress, [0, 0.1], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                <AnimatedCheckmark progress={checkProgress} size={22} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
