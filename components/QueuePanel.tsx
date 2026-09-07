"use client";

import { useState } from "react";
import type { Song } from "@/lib/songs";

type Tab = "next" | "history";

export default function QueuePanel({
  open,
  onClose,
  upNext,
  history,
  onJump,
  onReorder,
}: {
  open: boolean;
  onClose: () => void;
  upNext: Song[];
  history: Song[];
  onJump: (songId: number) => void;
  onReorder: (fromPos: number, toPos: number) => void;
}) {
  const [tab, setTab] = useState<Tab>("next");

  if (!open) return null;

  const list = tab === "next" ? upNext : history;

  return (
    <div className="glass absolute bottom-full left-0 right-0 z-40 mb-2 flex max-h-80 flex-col overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 pt-3">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setTab("next")}
            className={`pb-2.5 font-sans text-[12.5px] font-semibold transition-colors ${
              tab === "next"
                ? "border-b-2 border-brass-bright text-parchment"
                : "text-white/50"
            }`}
          >
            Up Next {upNext.length > 0 && `(${upNext.length})`}
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`pb-2.5 font-sans text-[12.5px] font-semibold transition-colors ${
              tab === "history"
                ? "border-b-2 border-brass-bright text-parchment"
                : "text-white/50"
            }`}
          >
            History {history.length > 0 && `(${history.length})`}
          </button>
        </div>
        <button
          type="button"
          aria-label="Close queue"
          onClick={onClose}
          className="mb-1 flex h-6 w-6 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="overflow-y-auto px-2 py-1.5">
        {list.length === 0 && (
          <p className="px-3 py-6 text-center font-sans text-[12px] text-white/40">
            {tab === "next" ? "Nothing queued yet." : "Nothing played yet this session."}
          </p>
        )}

        {list.map((song, pos) => (
          <div
            key={`${tab}-${song.id}-${pos}`}
            className="group flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-white/5"
          >
            <button
              type="button"
              onClick={() => tab === "next" && onJump(song.id)}
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
