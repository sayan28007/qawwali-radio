const LIKED_KEY = "mehfil-liked";

export function readLikedIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((n) => Number.isFinite(n)) : [];
  } catch {
    return [];
  }
}

export function writeLikedIds(ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(ids));
  } catch {
    // storage can fail (private mode, quota) — not worth surfacing to the user
  }
}

export function toggleLikedId(ids: number[], songId: number): number[] {
  const next = ids.includes(songId) ? ids.filter((id) => id !== songId) : [...ids, songId];
  writeLikedIds(next);
  return next;
}
