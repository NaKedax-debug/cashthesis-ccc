import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

export const { fontFamily: interFont } = loadInter("normal", {
  weights: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const { fontFamily: monoFont } = loadJetBrainsMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const COLORS = {
  bg: "#0a0a0f",
  surface: "#12121a",
  green: "#00e68a",
  red: "#ff4d6a",
  blue: "#4d8aff",
  gold: "#ffd700",
  white: "#ffffff",
  muted: "#888888",
} as const;

export const FPS = 24;

// Scene durations in frames at 24fps
export const SCENE_FRAMES = {
  hook: 192,       // 0-8s
  whatIs: 240,     // 8-18s
  speed: 288,      // 18-30s
  sideHustle: 288, // 30-42s
  setup: 288,      // 42-54s
  cta: 144,        // 54-60s
} as const;

// Scene start frames
export const SCENE_START = {
  hook: 0,
  whatIs: 192,
  speed: 432,
  sideHustle: 720,
  setup: 1008,
  cta: 1296,
} as const;

export const TOTAL_FRAMES = 1440; // 60s at 24fps
