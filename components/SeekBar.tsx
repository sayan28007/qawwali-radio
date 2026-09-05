"use client";

import { useCallback, useRef } from "react";

export default function SeekBar({
  progress,
  onSeek,
}: {
  /** 0..1 */
  progress: number;
  onSeek: (p: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const p = (clientX - rect.left) / rect.width;
      onSeek(Math.min(1, Math.max(0, p)));
    },
    [onSeek]
  );

  const pct = Math.min(100, Math.max(0, progress * 100));

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      tabIndex={0}
      onClick={(e) => seekFromClientX(e.clientX)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onSeek(Math.max(0, progress - 0.03));
        if (e.key === "ArrowRight") onSeek(Math.min(1, progress + 0.03));
      }}
      className="group relative flex h-6 w-full cursor-pointer items-center focus:outline-none"
    >
      <div className="relative h-[3px] w-full overflow-visible rounded-full bg-white/15">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brass-bright"
          style={{
            width: `${pct}%`,
            boxShadow: "0 0 8px 1px rgba(240, 192, 105, 0.65)",
          }}
        />
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-brass-bright opacity-0 shadow-[0_0_6px_rgba(0,0,0,0.5)] transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}
