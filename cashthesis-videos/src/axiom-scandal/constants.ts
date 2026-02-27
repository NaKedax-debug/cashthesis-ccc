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

export const FPS = 60;
export const SCENE_DURATION = 600; // 10s at 60fps
export const TRANSITION_DURATION = 20; // 20 frames
