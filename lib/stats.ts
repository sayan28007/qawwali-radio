import { songs, type Song } from "./songs";

const STATS_KEY = "mehfil-stats";
export const SESSION_GAP_MS = 10 * 60 * 1000; // 10 min idle = new session

export type StatsState = {
  totalSeconds: number;
  perSongSeconds: Record<number, number>; // songId -> seconds listened
  perSongPlays: Record<number, number>; // songId -> times started/replayed
  perHourSeconds: number[]; // 24 buckets, local hour of day
  perMonthSeconds: Record<string, number>; // "YYYY-M" -> seconds
  longestSessionSec: number;
};

function emptyStats(): StatsState {
  return {
    totalSeconds: 0,
    perSongSeconds: {},
    perSongPlays: {},
    perHourSeconds: new Array(24).fill(0),
    perMonthSeconds: {},
    longestSessionSec: 0,
  };
}

export function readStats(): StatsState {
  if (typeof window === "undefined") return emptyStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return emptyStats();
    const parsed = JSON.parse(raw);
    return { ...emptyStats(), ...parsed };
  } catch {
    return emptyStats();
  }
}

export function writeStats(s: StatsState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch {
    // storage can fail (private mode, quota) — not worth surfacing to the user
  }
}

export function recordListeningTick(songId: number, deltaSec: number, stats: StatsState): StatsState {
  const now = new Date();
  const hour = now.getHours();
  const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
  const perHourSeconds = stats.perHourSeconds.slice();
  perHourSeconds[hour] = (perHourSeconds[hour] || 0) + deltaSec;
  return {
    ...stats,
    totalSeconds: stats.totalSeconds + deltaSec,
    perSongSeconds: {
      ...stats.perSongSeconds,
      [songId]: (stats.perSongSeconds[songId] || 0) + deltaSec,
    },
    perHourSeconds,
    perMonthSeconds: {
      ...stats.perMonthSeconds,
      [monthKey]: (stats.perMonthSeconds[monthKey] || 0) + deltaSec,
    },
  };
}

export function recordPlayStart(songId: number, stats: StatsState): StatsState {
  return {
    ...stats,
    perSongPlays: {
      ...stats.perSongPlays,
      [songId]: (stats.perSongPlays[songId] || 0) + 1,
    },
  };
}

export function recordSession(durationSec: number, stats: StatsState): StatsState {
  if (durationSec <= stats.longestSessionSec) return stats;
  return { ...stats, longestSessionSec: durationSec };
}

// ---------- display helpers ----------

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

export function topSongs(stats: StatsState, n = 10): { song: Song; seconds: number }[] {
  return Object.entries(stats.perSongSeconds)
    .map(([id, seconds]) => ({ song: songs[Number(id) - 1], seconds }))
    .filter((e) => e.song && e.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, n);
}

export function mostReplayedSong(stats: StatsState): { song: Song; plays: number } | null {
  const entries = Object.entries(stats.perSongPlays);
  if (entries.length === 0) return null;
  const [id, plays] = entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best));
  const song = songs[Number(id) - 1];
  if (!song || plays <= 0) return null;
  return { song, plays };
}

export function mostPlayedHourLabel(stats: StatsState): string | null {
  const total = stats.perHourSeconds.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;
  let bestHour = 0;
  let bestVal = -1;
  stats.perHourSeconds.forEach((v, h) => {
    if (v > bestVal) {
      bestVal = v;
      bestHour = h;
    }
  });
  const fmt = (h: number) => {
    const period = h < 12 ? "AM" : "PM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12} ${period}`;
  };
  return `${fmt(bestHour)} – ${fmt((bestHour + 1) % 24)}`;
}

export function monthlyHistory(
  stats: StatsState,
  months = 6
): { label: string; seconds: number }[] {
  const now = new Date();
  const out: { label: string; seconds: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const label = d.toLocaleDateString(undefined, { month: "short" });
    out.push({ label, seconds: stats.perMonthSeconds[key] || 0 });
  }
  return out;
}
