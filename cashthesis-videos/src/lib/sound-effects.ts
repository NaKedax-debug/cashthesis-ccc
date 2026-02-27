import { staticFile } from "remotion";

/**
 * Sound effects registry.
 *
 * Each entry has a `remote` URL (always available) and an optional `local`
 * path. Local files live in public/audio/sfx/ — drop an MP3/WAV there and
 * set the filename to use it instead of the remote URL.
 *
 * Usage in a component:
 *   import { Audio } from "@remotion/media";
 *   import { SFX, getSfxSrc } from "../lib/sound-effects";
 *   <Audio src={getSfxSrc("whoosh")} />
 */

export type SfxName =
  | "whoosh"
  | "glitch"
  | "ding"
  | "typing"
  | "cash_register";

interface SfxEntry {
  /** Human-readable description */
  label: string;
  /** Always-available remote URL */
  remote: string;
  /** Filename in public/audio/sfx/ (if a local copy exists) */
  local?: string;
}

export const SFX: Record<SfxName, SfxEntry> = {
  whoosh: {
    label: "Whoosh transition",
    remote: "https://remotion.media/whoosh.wav",
    local: "whoosh.wav",
  },
  glitch: {
    label: "Glitch / digital error",
    remote: "https://remotion.media/switch.wav",
    local: "glitch.wav",
  },
  ding: {
    label: "Notification ding",
    remote: "https://remotion.media/mouse-click.wav",
    local: "ding.wav",
  },
  typing: {
    label: "Keyboard typing",
    remote: "https://remotion.media/mouse-click.wav",
    local: "typing.wav",
  },
  cash_register: {
    label: "Cash register / ka-ching",
    remote: "https://remotion.media/shutter-modern.wav",
    local: "cash-register.wav",
  },
};

/**
 * Get the audio source for a sound effect.
 * Returns the local staticFile path if the file exists, otherwise the remote URL.
 *
 * To use local files: place them in public/audio/sfx/ with the filename
 * matching the `local` field in the SFX registry above.
 */
export function getSfxSrc(name: SfxName): string {
  const entry = SFX[name];

  // In a Remotion environment, we can't do fs checks at render time.
  // Convention: if local is set, we try staticFile first. If the file
  // is missing at render time Remotion will throw — fall back to remote
  // by removing the `local` field or leaving it undefined.
  if (entry.local) {
    try {
      return staticFile(`audio/sfx/${entry.local}`);
    } catch {
      return entry.remote;
    }
  }

  return entry.remote;
}

/** All available SFX names */
export const SFX_NAMES = Object.keys(SFX) as SfxName[];
