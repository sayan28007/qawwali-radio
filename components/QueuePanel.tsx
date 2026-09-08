"use client";

import { useState } from "react";
import type { Song } from "@/lib/songs";

type Tab = "next" | "history" | "all" | "liked";

function HeartToggle({ liked, onClick }: { liked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
        liked ? "text-brass-bright" : "text-white/35"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s-7-4.35-9.5-8.5C.8 9 2 5.5 5.2 4.6 7.4 4 9.6 5 11 6.8 12.4 5 14.6 4 16.8 4.6 20 5.5 21.2 9 19.5 12.5 17 16.65 12 21 12 21Z" />
      </svg>
    </button>
  );
}

export default function QueuePanel({
  open,
  onClose,
  upNext,
  history,
  allSongs,
  liked,
  likedIds,
  onJump,
  onReorder,
  onToggleLike,
}: {
  open: boolean;
  onClose: () => void;
  upNext: Song[];
  history: Song[];
  allSongs: Song[];
  liked: Song[];
  likedIds: Set<number>;
  onJump: (songId: number) => void;
  onReorder: (fromPos: number, toPos: number) => void;
  onToggleLike: (songId: number) => void;
}) {
  const [tab, setTab] = useState<Tab>("next");

  if (!open) return null;

  const list =
    tab === "next" ? upNext : tab === "history" ? history : tab === "all" ? allSongs : liked;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "next", label: "Up Next", count: upNext.length },
    { key: "history", label: "History", count: history.length },
    { key: "all", label: "All Songs", count: allSongs.length },
    { key: "liked", label: "Liked", count: liked.length },
  ];

  return (
    <div className="glass absolute bottom-full left-0 right-0 z-40 mb-2 flex max-h-96 flex-col overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between border-b border-white/10 px-3 pt-3">
        <div className="flex gap-3 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`shrink-0 whitespace-nowrap pb-2.5 font-sans text-[12px] font-semibold transition-colors ${
                tab === t.key ? "border-b-2 border-brass-bright text-parchment" : "text-white/50"
              }`}
            >
              {t.label} {t.count > 0 && `(${t.count})`}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Close queue"
          onClick={onClose}
          className="mb-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="overflow-y-auto px-2 py-1.5">
        {list.length === 0 && (
          <p className="px-3 py-6 text-center font-sans text-[12px] text-white/40">
            {tab === "next" && "Nothing queued yet."}
            {tab === "history" && "Nothing played yet this session."}
            {tab === "all" && "No songs found."}
            {tab === "liked" && "No liked songs yet — tap the heart on any track."}
          </p>
        )}

        {list.map((song, pos) => (
          <div
            key={`${tab}-${song.id}-${pos}`}
            className="group flex items-center gap-1.5 rounded-xl px-2 py-2 hover:bg-white/5"
          >
            <HeartToggle liked={likedIds.has(song.id)} onClick={() => onToggleLike(song.id)} />

            <button
              type="button"
              onClick={() => onJump(song.id)}
              className="min-w-0 flex-1 truncate text-left font-sans text-[13px] text-parchment/90"
            >
              <span className="truncate">{song.title}</span>
            </button>

            {tab === "next" && (
              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={pos === 0}
                  onClick={() => onReorder(pos, pos - 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={pos === list.length - 1}
                  onClick={() => onReorder(pos, pos + 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
