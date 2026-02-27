import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Easing,
} from "remotion";
import { COLORS, interFont, monoFont } from "./constants";

// --- Section header ---

const SectionHeader: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 60,
        right: 60,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: monoFont,
          fontSize: 20,
          fontWeight: 400,
          color: COLORS.red,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        The Crime
      </div>
      <div
        style={{
          fontFamily: interFont,
          fontSize: 44,
          fontWeight: 800,
          color: COLORS.white,
          lineHeight: 1.2,
        }}
      >
        Inside the Breach
      </div>
    </div>
  );
};

// --- Timeline bars ---

const TIMELINE_EVENTS = [
  { label: "2025 Q1", desc: "Queries start", width: 30 },
  { label: "2025 Q2", desc: "10-20 wallets", width: 50 },
  { label: "2025 Q4", desc: "List sharing", width: 70 },
  { label: "2026 Feb", desc: "$200K plan", width: 100 },
];

const TimelineChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        top: 200,
        left: 60,
        right: 60,
      }}
    >
      <div
        style={{
          fontFamily: monoFont,
          fontSize: 16,
          color: COLORS.muted,
          marginBottom: 20,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        Insider Activity Timeline
      </div>
      {TIMELINE_EVENTS.map((event, i) => {
        const barSpring = spring({
          frame,
          fps,
          delay: Math.floor(i * 0.4 * fps),
          config: { damping: 200 },
          durationInFrames: Math.floor(1 * fps),
        });

        const barWidth = interpolate(barSpring, [0, 1], [0, event.width]);

        return (
          <div key={i} style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontFamily: monoFont,
                  fontSize: 18,
                  color: COLORS.white,
                  opacity: barSpring,
                }}
              >
                {event.label}
              </span>
              <span
                style={{
                  fontFamily: interFont,
                  fontSize: 16,
                  color: i === TIMELINE_EVENTS.length - 1 ? COLORS.red : COLORS.muted,
                  opacity: barSpring,
                }}
              >
                {event.desc}
              </span>
            </div>
            <div
              style={{
                height: 20,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${barWidth}%`,
                  backgroundColor:
                    i === TIMELINE_EVENTS.length - 1 ? COLORS.red : COLORS.blue,
                  borderRadius: 4,
                  opacity: 0.8,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Quote bubble ---

const QuoteBubble: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bounceIn = spring({
    frame,
    fps,
    delay: Math.floor(2 * fps),
    config: { damping: 12, stiffness: 180 },
    durationInFrames: Math.floor(1 * fps),
  });

  const scale = interpolate(bounceIn, [0, 1], [0.5, 1]);

  // Audio wave pulse
  const wavePulse = interpolate(
    Math.sin(frame * 0.2),
    [-1, 1],
    [0.7, 1]
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 620,
        left: 60,
        right: 60,
        transform: `scale(${scale})`,
        opacity: bounceIn,
      }}
    >
      {/* Audio wave indicator */}
      <div
        style={{
          display: "flex",
          gap: 4,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        {[0.6, 1, 0.4, 0.8, 0.5, 1, 0.3, 0.9, 0.6, 0.7].map((h, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: 20 * h * wavePulse,
              backgroundColor: COLORS.red,
              borderRadius: 2,
              opacity: 0.7,
            }}
          />
        ))}
        <span
          style={{
            fontFamily: monoFont,
            fontSize: 14,
            color: COLORS.red,
            marginLeft: 12,
            letterSpacing: 1,
          }}
        >
          LEAKED CALL
        </span>
      </div>

      {/* Quote card */}
      <div
        style={{
          backgroundColor: "rgba(255,77,106,0.08)",
          border: `1px solid rgba(255,77,106,0.2)`,
          borderRadius: 12,
          padding: "24px 28px",
          borderLeft: `4px solid ${COLORS.red}`,
        }}
      >
        <div
          style={{
            fontFamily: interFont,
            fontSize: 30,
            fontWeight: 600,
            color: COLORS.white,
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          &ldquo;Find anything about that person&hellip; let&apos;s make this $200K quick&rdquo;
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: monoFont,
            fontSize: 18,
            color: COLORS.red,
          }}
        >
          — Broox Bauer (@WheresBroox)
        </div>
        <div
          style={{
            fontFamily: interFont,
            fontSize: 14,
            color: COLORS.muted,
            marginTop: 4,
          }}
        >
          Senior BD Employee, Axiom Exchange
        </div>
      </div>
    </div>
  );
};

// --- Data table ---

const TABLE_ROWS = [
  { employee: "Broox Bauer", action: "Wallet Queries", profit: "$200K Scheme" },
  { employee: "Accomplices", action: "List Distribution", profit: "Unknown" },
];

const DataTable: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tableOpacity = interpolate(frame, [4 * fps, 5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 1050,
        left: 60,
        right: 60,
        opacity: tableOpacity,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid rgba(255,255,255,0.1)`,
          paddingBottom: 10,
          marginBottom: 10,
        }}
      >
        {["Employee", "Action", "Profit"].map((h) => (
          <div
            key={h}
            style={{
              flex: 1,
              fontFamily: monoFont,
              fontSize: 16,
              color: COLORS.muted,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {h}
          </div>
        ))}
      </div>
      {/* Data rows */}
      {TABLE_ROWS.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            paddingBottom: 12,
            paddingTop: 8,
            borderBottom: `1px solid rgba(255,255,255,0.04)`,
          }}
        >
          <div
            style={{
              flex: 1,
              fontFamily: monoFont,
              fontSize: 20,
              fontWeight: 700,
              color: COLORS.white,
            }}
          >
            {row.employee}
          </div>
          <div
            style={{
              flex: 1,
              fontFamily: interFont,
              fontSize: 20,
              color: COLORS.blue,
            }}
          >
            {row.action}
          </div>
          <div
            style={{
              flex: 1,
              fontFamily: monoFont,
              fontSize: 20,
              fontWeight: 700,
              color: COLORS.red,
            }}
          >
            {row.profit}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Caption ---

const CAPTION =
  "Broox Bauer queried user wallets via internal tools for 1+ year. Leaked calls reveal $200K profit plans and shared screenshots.";

const Caption2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [5.5 * fps, 6.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: 60,
        right: 60,
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          fontFamily: interFont,
          fontSize: 28,
          fontWeight: 600,
          color: COLORS.green,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        {CAPTION}
      </div>
    </div>
  );
};

// ============================================
// Scene 2 Main Export
// ============================================

export const Scene2Crime: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence from={0} premountFor={fps}>
        <SectionHeader />
      </Sequence>

      <Sequence from={Math.floor(0.3 * fps)} premountFor={fps}>
        <TimelineChart />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <QuoteBubble />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <DataTable />
      </Sequence>

      <Sequence from={0} premountFor={fps}>
        <Caption2 />
      </Sequence>
    </AbsoluteFill>
  );
};
