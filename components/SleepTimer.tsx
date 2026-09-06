"use client";

import { useEffect, useRef, useState } from "react";

export type SleepSelection =
  | { type: "off" }
  | { type: "duration"; minutes: number }
  | { type: "end-of-song" }
  | { type: "sunrise" };

const DURATIONS = [5, 15, 30, 45, 60];

export default function SleepTimer({
  active,
  label,
  onSelect,
}: {
  /** whether any sleep mode is currently armed */
  active: boolean;
  /** text shown on the button, e.g. a countdown or "End of song" */
  label: string | null;
  onSelect: (selection: SleepSelection) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const choose = (selection: SleepSelection) => {
    onSelect(selection);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label="Sleep timer"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 items-center gap-1 rounded-full px-2 text-[11px] font-medium tabular-nums transition-colors hover:bg-white/10 ${
          active ? "text-brass-bright" : "text-white/70"
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
        <div className="glass absolute bottom-full right-0 z-40 mb-2 w-44 rounded-2xl p-1.5">
          <p className="px-2 pb-1 pt-0.5 font-sans text-[10px] uppercase tracking-wide text-white/45">
            Sleep timer
          </p>

          {DURATIONS.map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => choose({ type: "duration", minutes: mins })}
              className="block w-full rounded-lg px-2 py-1.5 text-left font-sans text-[12.5px] text-parchment/90 hover:bg-white/10"
            >
              {mins} min
            </button>
          ))}

          <div className="my-1 h-px bg-white/10" />

          <button
            type="button"
            onClick={() => choose({ type: "end-of-song" })}
            className="block w-full rounded-lg px-2 py-1.5 text-left font-sans text-[12.5px] text-parchment/90 hover:bg-white/10"
          >
            End of current song
          </button>
          <button
            type="button"
            onClick={() => choose({ type: "sunrise" })}
            className="block w-full rounded-lg px-2 py-1.5 text-left font-sans text-[12.5px] text-parchment/90 hover:bg-white/10"
          >
            At sunrise 🌅
          </button>

          {active && (
            <>
              <div className="my-1 h-px bg-white/10" />
              <button
                type="button"
                onClick={() => choose({ type: "off" })}
                className="block w-full rounded-lg px-2 py-1.5 text-left font-sans text-[12.5px] text-white/60 hover:bg-white/10"
              >
                Turn off
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
