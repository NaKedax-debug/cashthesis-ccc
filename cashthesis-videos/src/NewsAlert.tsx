import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

const COLORS = {
  bg: "#0a0a0f",
  red: "#ff4d6a",
  green: "#00e68a",
  white: "#ffffff",
  muted: "#888888",
};

const FACTS = [
  "Pay anywhere Mastercard is accepted",
  "Spend crypto directly — no conversion needed",
  "Available in the United States now",
  "Supports ETH, USDC, and more",
];

// --- Background: Animated Grid ---

const AnimatedGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const GRID_SIZE = 80;
  const drift = (frame * 0.5) % GRID_SIZE;

  const lines: React.ReactNode[] = [];

  // Horizontal lines
  for (let y = -GRID_SIZE; y <= 1920 + GRID_SIZE; y += GRID_SIZE) {
    lines.push(
      <div
        key={`h-${y}`}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y - drift,
          height: 1,
          backgroundColor: "rgba(255,255,255,0.03)",
        }}
      />
    );
  }

  // Vertical lines
  for (let x = 0; x <= 1080; x += GRID_SIZE) {
    lines.push(
      <div
        key={`v-${x}`}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: x,
          width: 1,
          backgroundColor: "rgba(255,255,255,0.03)",
        }}
      />
    );
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {lines}
    </AbsoluteFill>
  );
};

// --- Background: Floating Crypto Symbols ---

const SYMBOLS = ["₿", "Ξ", "◈", "$", "₮", "₿", "Ξ", "◈", "$", "₮"];

const FloatingSymbols: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {SYMBOLS.map((symbol, i) => {
        // Deterministic positioning based on index
        const baseX = ((i * 137 + 50) % 980) + 50;
        const baseY = ((i * 211 + 100) % 1720) + 100;
        const size = 28 + (i % 3) * 12;
        const speed = 0.15 + (i % 4) * 0.05;
        const sway = 15 + (i % 3) * 10;

        const y = baseY - frame * speed;
        const x = baseX + Math.sin((frame + i * 40) * 0.02) * sway;
        const opacity = 0.04 + (i % 3) * 0.02;
        const rotation = Math.sin((frame + i * 60) * 0.01) * 15;

        // Wrap around when going off screen
        const wrappedY = ((y % 2100) + 2100) % 2100 - 100;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: wrappedY,
              fontSize: size,
              color: i % 2 === 0 ? COLORS.green : COLORS.red,
              opacity,
              transform: `rotate(${rotation}deg)`,
              fontFamily: "monospace",
            }}
          >
            {symbol}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// --- Inline SVG: MetaMask Fox ---

const MetaMaskLogo: React.FC<{ size?: number }> = ({ size = 80 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
    >
      {/* Simplified MetaMask fox head */}
      <polygon points="50,8 80,35 75,65 62,55 50,62 38,55 25,65 20,35" fill="#E2761B" />
      <polygon points="50,8 20,35 25,65 38,55 50,45" fill="#E4751F" />
      <polygon points="50,8 80,35 75,65 62,55 50,45" fill="#D5631E" />
      <polygon points="38,55 25,65 30,80 42,72 50,62" fill="#CD6116" />
      <polygon points="62,55 75,65 70,80 58,72 50,62" fill="#E4751F" />
      <polygon points="30,80 42,72 50,85 58,72 70,80 50,95" fill="#F6851B" />
      <polygon points="42,72 50,62 58,72 50,85" fill="#E2761B" />
      {/* Eyes */}
      <circle cx="38" cy="38" r="4" fill="#233447" />
      <circle cx="62" cy="38" r="4" fill="#233447" />
    </svg>
  );
};

// --- Inline SVG: Mastercard Logo ---

const MastercardLogo: React.FC<{ size?: number }> = ({ size = 80 }) => {
  const h = size;
  const w = size * 1.3;
  return (
    <svg width={w} height={h} viewBox="0 0 130 100" fill="none">
      <circle cx="45" cy="50" r="35" fill="#EB001B" />
      <circle cx="85" cy="50" r="35" fill="#F79E1B" />
      {/* Overlap area */}
      <path
        d="M65,22.7 A35,35 0 0,1 65,77.3 A35,35 0 0,1 65,22.7"
        fill="#FF5F00"
      />
    </svg>
  );
};

// --- Brand Logos Row ---

const BrandLogos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 1 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.floor(1 * fps),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 130,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <MetaMaskLogo size={90} />
      <div
        style={{
          fontFamily,
          fontSize: 36,
          fontWeight: 700,
          color: "rgba(255,255,255,0.3)",
        }}
      >
        ×
      </div>
      <MastercardLogo size={90} />
    </div>
  );
};

// --- Breaking News Banner ---

const BreakingBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.floor(0.5 * fps),
  });

  const translateY = interpolate(slideIn, [0, 1], [-120, 0]);

  // Pulsing dot
  const dotOpacity = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.4, 1]
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        transform: `translateY(${translateY}px)`,
        backgroundColor: COLORS.red,
        padding: "24px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: COLORS.white,
          opacity: dotOpacity,
        }}
      />
      <span
        style={{
          fontFamily,
          fontSize: 32,
          fontWeight: 700,
          color: COLORS.white,
          letterSpacing: 6,
          textTransform: "uppercase",
        }}
      >
        Breaking News
      </span>
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: COLORS.white,
          opacity: dotOpacity,
        }}
      />
    </div>
  );
};

// --- Headline ---

const Headline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 1.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 260,
        left: 60,
        right: 60,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: 58,
          fontWeight: 700,
          color: COLORS.white,
          lineHeight: 1.25,
          textAlign: "center",
        }}
      >
        MetaMask and Mastercard Launch Crypto Card in the US
      </div>
    </div>
  );
};

// --- Typewriter Fact Item ---

const CHARS_PER_FRAME = 0.6; // ~18 chars/sec at 30fps

const FactItem: React.FC<{ index: number; text: string }> = ({ index, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Number slides in with spring
  const numberSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 200 },
    durationInFrames: Math.floor(0.5 * fps),
  });

  const numberScale = numberSpring;
  const numberOpacity = numberSpring;

  // Typewriter starts after number appears (0.3s delay)
  const typewriterStart = Math.floor(0.3 * fps);
  const typewriterFrame = Math.max(0, frame - typewriterStart);
  const charCount = Math.min(
    text.length,
    Math.floor(typewriterFrame * CHARS_PER_FRAME)
  );
  const displayText = text.slice(0, charCount);
  const isTyping = charCount < text.length && frame >= typewriterStart;

  // Blinking cursor
  const cursorVisible = isTyping && Math.floor(frame / 8) % 2 === 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
        padding: "16px 0",
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: 48,
          fontWeight: 700,
          color: COLORS.green,
          lineHeight: 1,
          minWidth: 50,
          opacity: numberOpacity,
          transform: `scale(${numberScale})`,
        }}
      >
        {index + 1}
      </div>
      <div
        style={{
          fontFamily,
          fontSize: 38,
          fontWeight: 600,
          color: COLORS.white,
          lineHeight: 1.35,
        }}
      >
        {displayText}
        {cursorVisible && (
          <span style={{ color: COLORS.green, fontWeight: 400 }}>|</span>
        )}
      </div>
    </div>
  );
};

// --- Gradient Separator ---

const FactsSeparator: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const width = interpolate(
    frame,
    [0, 0.5 * fps],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 600,
        left: 60,
        right: 60,
        height: 2,
        background: `linear-gradient(90deg, ${COLORS.red}, ${COLORS.green})`,
        width: `${width}%`,
      }}
    />
  );
};

// --- End Card ---

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 1 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.floor(1 * fps),
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
        backgroundColor: "rgba(10, 10, 15, 0.85)",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.white,
            lineHeight: 1.4,
          }}
        >
          Follow{" "}
          <span style={{ color: COLORS.green }}>@CashThesis</span>
          <br />
          for AI + Crypto news
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily,
            fontSize: 24,
            fontWeight: 400,
            color: COLORS.muted,
          }}
        >
          Trends · Content · Money
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Watermark ---

const Watermark: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        right: 40,
        fontFamily,
        fontSize: 24,
        fontWeight: 600,
        color: COLORS.green,
        opacity: 0.3,
      }}
    >
      CashThesis
    </div>
  );
};

// ============================================
// Main Composition
// ============================================

export const NewsAlert = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Layer 0: Animated grid background */}
      <AnimatedGrid />

      {/* Layer 1: Floating crypto symbols */}
      <FloatingSymbols />

      {/* Layer 2: Breaking news banner */}
      <Sequence from={0} premountFor={fps}>
        <BreakingBanner />
      </Sequence>

      {/* Layer 3: Brand logos (MetaMask × Mastercard) */}
      <Sequence from={Math.floor(0.3 * fps)} premountFor={fps}>
        <BrandLogos />
      </Sequence>

      {/* Layer 4: Headline */}
      <Sequence from={Math.floor(0.5 * fps)} premountFor={fps}>
        <Headline />
      </Sequence>

      {/* Layer 5: Separator line */}
      <Sequence from={Math.floor(3.5 * fps)} premountFor={fps}>
        <FactsSeparator />
      </Sequence>

      {/* Layer 6: Facts with typewriter effect */}
      {FACTS.map((fact, i) => (
        <Sequence
          key={i}
          from={Math.floor((4 + i * 3) * fps)}
          premountFor={fps}
        >
          <div
            style={{
              position: "absolute",
              top: 630 + i * 130,
              left: 60,
              right: 60,
            }}
          >
            <FactItem index={i} text={fact} />
          </div>
        </Sequence>
      ))}

      {/* Layer 7: End card */}
      <Sequence from={Math.floor(22 * fps)} premountFor={fps}>
        <EndCard />
      </Sequence>

      {/* Layer 8: Watermark (always visible) */}
      <Watermark />
    </AbsoluteFill>
  );
};
