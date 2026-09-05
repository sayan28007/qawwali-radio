"use client";

import { useEffect, useRef, useState } from "react";

const DURATIONS = [15, 30, 45, 60];

export default function SleepTimer({
  onExpire,
}: {
  /** called once when the countdown reaches zero */
  onExpire: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (remainingSec == null) return;
    if (remainingSec <= 0) {
      setRemainingSec(null);
      onExpire();
      return;
    }
    const id = setTimeout(() => setRemainingSec((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(id);
  }, [remainingSec, onExpire]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const label =
    remainingSec != null
      ? `${Math.floor(remainingSec / 60)}:${String(remainingSec % 60).padStart(2, "0")}`
      : null;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label="Sleep timer"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 items-center gap-1 rounded-full px-2 text-[11px] font-medium tabular-nums transition-colors hover:bg-white/10 ${
          remainingSec != null ? "text-brass-bright" : "text-white/70"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9.5V13l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 2h5" strokeLinecap="round" />
        </svg>
        {label}
      </button>

      {open && (
        <div className="glass absolute bottom-full right-0 z-40 mb-2 w-36 rounded-2xl p-1.5">
          <p className="px-2 pb-1 pt-0.5 font-sans text-[10px] uppercase tracking-wide text-white/45">
            Sleep timer
          </p>
          {DURATIONS.map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => {
                setRemainingSec(mins * 60);
                setOpen(false);
              }}
              className="block w-full rounded-lg px-2 py-1.5 text-left font-sans text-[12.5px] text-parchment/90 hover:bg-white/10"
            >
              {mins} min
            </button>
          ))}
          {remainingSec != null && (
            <button
              type="button"
              onClick={() => {
                setRemainingSec(null);
                setOpen(false);
              }}
              className="mt-0.5 block w-full rounded-lg px-2 py-1.5 text-left font-sans text-[12.5px] text-white/60 hover:bg-white/10"
            >
              Turn off
            </button>
          )}
        </div>
      )}
    </div>
  );
}
