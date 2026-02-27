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

// --- Colors ---

const C = {
  phoneBg: "#000000",
  chatBg: "#0b141a",
  header: "#1f2c34",
  botBubble: "#005c4b",
  userBubble: "#1f2c34",
  white: "#ffffff",
  green: "#00e68a",
  whatsGreen: "#25d366",
  checkBlue: "#53bdeb",
  timestamp: "rgba(255,255,255,0.45)",
  outerBg: "#0a0a0f",
};

// --- Phone dimensions (scaled for 1080x1920 canvas) ---

const PHONE = {
  width: 860,
  height: 1680,
  borderRadius: 70,
  bezelWidth: 12,
  notchWidth: 280,
  notchHeight: 36,
  screenPadding: 14,
};

// --- Message data ---

type Msg = {
  text: string;
  sender: "bot" | "user";
  showAt: number; // seconds - when message appears
  typingAt: number; // seconds - when typing indicator starts
  time: string; // display timestamp
};

const MESSAGES: Msg[] = [
  {
    text: "I found 3 ways to make money with AI today 🤖",
    sender: "bot",
    typingAt: 0.5,
    showAt: 2.0,
    time: "9:41",
  },
  {
    text: "Show me",
    sender: "user",
    typingAt: 3.5,
    showAt: 4.5,
    time: "9:41",
  },
  {
    text: "1. Sell AI-generated images on stock sites — $500/mo",
    sender: "bot",
    typingAt: 5.5,
    showAt: 7.5,
    time: "9:42",
  },
  {
    text: "2. Build AI chatbots for local businesses — $2,000/mo",
    sender: "bot",
    typingAt: 9.0,
    showAt: 11.0,
    time: "9:42",
  },
  {
    text: "3. AI content factory on YouTube — $3,000/mo",
    sender: "bot",
    typingAt: 12.5,
    showAt: 14.5,
    time: "9:43",
  },
  {
    text: "How do I start? 🔥",
    sender: "user",
    typingAt: 16.5,
    showAt: 18.0,
    time: "9:43",
  },
  {
    text: "Follow @CashThesis — I'll show you everything",
    sender: "bot",
    typingAt: 19.5,
    showAt: 21.5,
    time: "9:44",
  },
];

// --- SVG: Blue double checkmarks ---

const ReadReceipt: React.FC = () => (
  <svg width={20} height={12} viewBox="0 0 20 12" style={{ marginLeft: 4 }}>
    <polyline
      points="1,6 5,10 12,2"
      fill="none"
      stroke={C.checkBlue}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="6,6 10,10 17,2"
      fill="none"
      stroke={C.checkBlue}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- Typing indicator (three bouncing dots) ---

const TypingIndicator: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        backgroundColor: C.userBubble,
        padding: "14px 20px",
        borderRadius: 18,
        borderTopLeftRadius: 4,
      }}
    >
      {[0, 1, 2].map((i) => {
        const bounce = Math.sin((frame * 0.2) + i * 1.2) * 0.5 + 0.5;
        const y = -bounce * 8;
        const opacity = 0.4 + bounce * 0.6;
        return (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.6)",
              transform: `translateY(${y}px)`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

// --- Chat message bubble ---

const ChatBubble: React.FC<{
  text: string;
  sender: "bot" | "user";
  time: string;
  showAtFrame: number;
}> = ({ text, sender, time, showAtFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isBot = sender === "bot";

  // Not visible yet
  if (frame < showAtFrame) return null;

  const entrance = spring({
    frame: frame - showAtFrame,
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  const slideY = interpolate(entrance, [0, 1], [40, 0]);
  const opacity = entrance;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        paddingLeft: isBot ? 0 : 60,
        paddingRight: isBot ? 60 : 0,
        transform: `translateY(${slideY}px)`,
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: isBot ? C.botBubble : C.userBubble,
          padding: "12px 16px 8px 16px",
          borderRadius: 18,
          borderTopLeftRadius: isBot ? 4 : 18,
          borderTopRightRadius: isBot ? 18 : 4,
          maxWidth: 520,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 400,
            color: C.white,
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {text}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: 4,
            gap: 2,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: 18,
              color: C.timestamp,
            }}
          >
            {time}
          </span>
          {!isBot && <ReadReceipt />}
        </div>
      </div>
    </div>
  );
};

// --- Chat header ---

const ChatHeader: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
        backgroundColor: C.header,
      }}
    >
      {/* Back arrow */}
      <svg width={24} height={24} viewBox="0 0 24 24">
        <polyline
          points="15,4 7,12 15,20"
          fill="none"
          stroke={C.white}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Avatar */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          backgroundColor: "#075e54",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 28,
          position: "relative",
          flexShrink: 0,
        }}
      >
        🤖
        {/* Online dot */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: C.whatsGreen,
            border: `2px solid ${C.header}`,
          }}
        />
      </div>

      {/* Name + status */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 600,
            color: C.white,
          }}
        >
          AI Money Bot
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 20,
            fontWeight: 400,
            color: C.whatsGreen,
          }}
        >
          online
        </div>
      </div>

      {/* Icons */}
      <svg width={28} height={28} viewBox="0 0 24 24">
        <circle cx={12} cy={5} r={2} fill="rgba(255,255,255,0.5)" />
        <circle cx={12} cy={12} r={2} fill="rgba(255,255,255,0.5)" />
        <circle cx={12} cy={19} r={2} fill="rgba(255,255,255,0.5)" />
      </svg>
    </div>
  );
};

// --- iPhone notch ---

const Notch: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: PHONE.notchWidth,
        height: PHONE.notchHeight,
        backgroundColor: C.phoneBg,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        zIndex: 10,
      }}
    />
  );
};

// --- Status bar (time, signal, battery) ---

const StatusBar: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 28px 8px",
        backgroundColor: C.header,
      }}
    >
      <span style={{ fontFamily, fontSize: 22, fontWeight: 600, color: C.white }}>
        9:41
      </span>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {/* Signal bars */}
        <svg width={28} height={18} viewBox="0 0 28 18">
          <rect x={0} y={12} width={5} height={6} rx={1} fill={C.white} />
          <rect x={7} y={8} width={5} height={10} rx={1} fill={C.white} />
          <rect x={14} y={4} width={5} height={14} rx={1} fill={C.white} />
          <rect x={21} y={0} width={5} height={18} rx={1} fill={C.white} />
        </svg>
        {/* Battery */}
        <svg width={36} height={18} viewBox="0 0 36 18">
          <rect x={0} y={2} width={30} height={14} rx={3} fill="none" stroke={C.white} strokeWidth={1.5} />
          <rect x={3} y={5} width={22} height={8} rx={1.5} fill={C.whatsGreen} />
          <rect x={31} y={6} width={3} height={6} rx={1} fill={C.white} />
        </svg>
      </div>
    </div>
  );
};

// --- WhatsApp wallpaper pattern (subtle) ---

const ChatWallpaper: React.FC = () => {
  const icons = ["💬", "📎", "📷", "🎤", "📞", "😊", "👋", "❤️", "🔒", "⭐"];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {icons.map((icon, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 60 + col * 160,
              top: 80 + row * 350,
              fontSize: 28,
              opacity: 0.04,
              transform: `rotate(${(i * 37) % 360}deg)`,
            }}
          >
            {icon}
          </div>
        );
      })}
    </div>
  );
};

// --- Input bar at bottom ---

const InputBar: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        backgroundColor: C.chatBg,
      }}
    >
      {/* Emoji icon */}
      <svg width={32} height={32} viewBox="0 0 24 24">
        <circle cx={12} cy={12} r={10} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} />
        <circle cx={8.5} cy={10} r={1.2} fill="rgba(255,255,255,0.4)" />
        <circle cx={15.5} cy={10} r={1.2} fill="rgba(255,255,255,0.4)" />
        <path d="M8 14.5 Q12 18 16 14.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} strokeLinecap="round" />
      </svg>

      {/* Text field */}
      <div
        style={{
          flex: 1,
          backgroundColor: C.header,
          borderRadius: 24,
          padding: "12px 20px",
          fontFamily,
          fontSize: 24,
          color: "rgba(255,255,255,0.35)",
        }}
      >
        Type a message
      </div>

      {/* Mic icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: C.whatsGreen,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <svg width={22} height={22} viewBox="0 0 24 24">
          <rect x={9} y={2} width={6} height={12} rx={3} fill={C.white} />
          <path d="M5 11 C5 15.5 8 18 12 18 C16 18 19 15.5 19 11" fill="none" stroke={C.white} strokeWidth={2} strokeLinecap="round" />
          <line x1={12} y1={18} x2={12} y2={22} stroke={C.white} strokeWidth={2} strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

// --- Watermark ---

const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 1 * fps],
    [0, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        right: 60,
        fontFamily,
        fontSize: 24,
        fontWeight: 600,
        color: C.green,
        opacity,
      }}
    >
      CashThesis
    </div>
  );
};

// ============================================
// Main Composition
// ============================================

export const ChatDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone entrance
  const phoneEntrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const phoneScale = interpolate(phoneEntrance, [0, 1], [0.9, 1]);
  const phoneOpacity = phoneEntrance;

  // Determine which typing indicator is currently visible
  // A typing indicator is visible between its typingAt and the corresponding showAt
  const currentTyping = MESSAGES.find((msg) => {
    const typingFrame = Math.floor(msg.typingAt * fps);
    const showFrame = Math.floor(msg.showAt * fps);
    return frame >= typingFrame && frame < showFrame;
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.outerBg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Phone glow */}
      <div
        style={{
          position: "absolute",
          width: PHONE.width + 100,
          height: PHONE.height + 100,
          borderRadius: PHONE.borderRadius + 20,
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(37, 211, 102, 0.08) 0%, transparent 70%)",
          opacity: phoneOpacity,
        }}
      />

      {/* Phone frame */}
      <div
        style={{
          width: PHONE.width,
          height: PHONE.height,
          borderRadius: PHONE.borderRadius,
          border: `${PHONE.bezelWidth}px solid #1a1a1a`,
          backgroundColor: C.phoneBg,
          overflow: "hidden",
          position: "relative",
          transform: `scale(${phoneScale})`,
          opacity: phoneOpacity,
          boxShadow:
            "0 0 60px rgba(0,0,0,0.8), 0 0 120px rgba(37, 211, 102, 0.06)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Notch */}
        <Notch />

        {/* Status bar */}
        <StatusBar />

        {/* Chat header */}
        <ChatHeader />

        {/* Chat area */}
        <div
          style={{
            flex: 1,
            backgroundColor: C.chatBg,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <ChatWallpaper />

          {/* Messages container */}
          <div
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            {/* Rendered messages */}
            {MESSAGES.map((msg, i) => (
              <ChatBubble
                key={i}
                text={msg.text}
                sender={msg.sender}
                time={msg.time}
                showAtFrame={Math.floor(msg.showAt * fps)}
              />
            ))}

            {/* Typing indicator */}
            {currentTyping && (
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    currentTyping.sender === "bot"
                      ? "flex-start"
                      : "flex-end",
                }}
              >
                <TypingIndicator />
              </div>
            )}
          </div>
        </div>

        {/* Input bar */}
        <InputBar />
      </div>

      {/* Watermark */}
      <Sequence from={Math.floor(25 * fps)} premountFor={fps}>
        <Watermark />
      </Sequence>
    </AbsoluteFill>
  );
};
