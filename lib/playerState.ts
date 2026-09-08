const PROGRESS_KEY = "mehfil-progress";
const PROGRESS_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export type ProgressState = {
  songId: number;
  elapsedSec: number;
  savedAt: number;
};

export function saveProgress(songId: number, elapsedSec: number) {
  if (typeof window === "undefined") return;
  try {
    const state: ProgressState = { songId, elapsedSec, savedAt: Date.now() };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  } catch {
    // storage can fail (private mode, quota) — not worth surfacing to the user
  }
}

export function readProgress(): ProgressState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as ProgressState;
    if (Date.now() - state.savedAt > PROGRESS_MAX_AGE_MS) return null;
    if (!Number.isFinite(state.songId) || !Number.isFinite(state.elapsedSec)) return null;
    return state;
  } catch {
    return null;
  }
}

export const SHARE_MESSAGES = [
  "I thought you might like this.",
  "Listen to this qawwali.",
] as const;

export type SharedIntent = {
  songId: number;
  messageIndex: number;
};

export function readSharedIntent(): SharedIntent | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const songParam = params.get("song");
  const msgParam = params.get("msg");
  if (!songParam) return null;
  const songId = parseInt(songParam, 10);
  const messageIndex = msgParam ? parseInt(msgParam, 10) : 0;
  if (!Number.isFinite(songId)) return null;
  return {
    songId,
    messageIndex: SHARE_MESSAGES[messageIndex] ? messageIndex : 0,
  };
}

export function buildShareUrl(songId: number, messageIndex: number): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("song", String(songId));
  url.searchParams.set("msg", String(messageIndex));
  return url.toString();
}
