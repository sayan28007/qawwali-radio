"use client";

import {
  formatDuration,
  monthlyHistory,
  mostPlayedHourLabel,
  mostReplayedSong,
  readStats,
  topSongs,
} from "@/lib/stats";
import Transition from "./Transition";

export default function StatsCard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = readStats();
  const top = topSongs(stats, 10);
  const replayed = mostReplayedSong(stats);
  const hourLabel = mostPlayedHourLabel(stats);
  const months = monthlyHistory(stats, 6);
  const maxMonthSec = Math.max(1, ...months.map((m) => m.seconds));

  return (
    <Transition
      show={open}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    >
      <div onClick={onClose} className="absolute inset-0" aria-hidden />
      <div
        className="glass relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[28px] p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[19px] font-semibold italic text-parchment">
            Your Mehfil Stats
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {stats.totalSeconds === 0 ? (
          <p className="py-8 text-center font-sans text-[13px] text-white/45">
            No listening yet — your stats will show up here once you've played a few songs.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Total time */}
            <div className="rounded-2xl bg-white/5 px-4 py-3">
              <p className="font-sans text-[10.5px] uppercase tracking-wide text-white/45">
                Total listening time
              </p>
              <p className="font-display text-[22px] font-semibold text-brass-bright">
                {formatDuration(stats.totalSeconds)}
              </p>
            </div>

            {/* Quick facts row */}
            <div className="grid grid-cols-2 gap-2.5">
              {replayed && (
                <div className="rounded-2xl bg-white/5 px-3 py-2.5">
                  <p className="font-sans text-[10px] uppercase tracking-wide text-white/45">
                    Most replayed
                  </p>
                  <p className="truncate font-sans text-[12.5px] font-medium text-parchment">
                    {replayed.song.title}
                  </p>
                  <p className="font-sans text-[10.5px] text-white/45">{replayed.plays} plays</p>
                </div>
              )}
              {hourLabel && (
                <div className="rounded-2xl bg-white/5 px-3 py-2.5">
                  <p className="font-sans text-[10px] uppercase tracking-wide text-white/45">
                    Most played hour
                  </p>
                  <p className="font-sans text-[12.5px] font-medium text-parchment">{hourLabel}</p>
                </div>
              )}
              {stats.longestSessionSec > 0 && (
                <div className="col-span-2 rounded-2xl bg-white/5 px-3 py-2.5">
                  <p className="font-sans text-[10px] uppercase tracking-wide text-white/45">
                    Longest listening session
                  </p>
                  <p className="font-sans text-[12.5px] font-medium text-parchment">
                    {formatDuration(stats.longestSessionSec)}
                  </p>
                </div>
              )}
            </div>

            {/* Monthly history bars */}
            <div>
              <p className="mb-2 font-sans text-[10.5px] uppercase tracking-wide text-white/45">
                Monthly listening history
              </p>
              <div className="flex items-end gap-2">
                {months.map((m) => (
                  <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-16 w-full items-end">
                      <div
                        className="w-full rounded-t-md bg-brass-bright/70"
                        style={{
                          height: `${Math.max(3, (m.seconds / maxMonthSec) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="font-sans text-[9.5px] text-white/45">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top songs */}
            {top.length > 0 && (
              <div>
                <p className="mb-1.5 font-sans text-[10.5px] uppercase tracking-wide text-white/45">
                  Top songs
                </p>
                <div className="flex flex-col">
                  {top.map((entry, i) => (
                    <div
                      key={entry.song.id}
                      className="flex items-center gap-2.5 border-b border-white/5 py-2 last:border-none"
                    >
                      <span className="w-4 shrink-0 font-sans text-[11px] text-white/35">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-sans text-[12.5px] text-parchment/90">
                        {entry.song.title}
                      </span>
                      <span className="shrink-0 font-sans text-[11px] tabular-nums text-white/45">
                        {formatDuration(entry.seconds)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Transition>
  );
}
