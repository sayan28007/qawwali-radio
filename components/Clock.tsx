"use client";

import { useEffect, useState } from "react";

function formatJoinedLine(joinedAt: number, now: Date): string {
  const joined = new Date(joinedAt);
  const time = joined.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const elapsedMin = Math.max(0, Math.floor((now.getTime() - joinedAt) / 60000));
  const elapsedLabel =
    elapsedMin < 60 ? `${elapsedMin}m` : `${Math.floor(elapsedMin / 60)}h ${elapsedMin % 60}m`;
  return `Joined ${time} · ${elapsedLabel}`;
}

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  const [joinedAt, setJoinedAt] = useState<number | null>(null);

  useEffect(() => {
    setNow(new Date());
    try {
      const raw = sessionStorage.getItem("mehfil-entered");
      if (raw) {
        const ts = Number(raw);
        if (Number.isFinite(ts)) setJoinedAt(ts);
      }
    } catch {
      // ignore
    }
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now
    ? now.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <div
      className="fixed left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] z-30 select-none"
      suppressHydrationWarning
    >
      <div className="glass rounded-2xl px-3.5 py-2">
        <span className="font-sans text-[13px] font-semibold tabular-nums text-parchment/90">
          {time}
        </span>
        {joinedAt != null && now != null && (
          <p className="mt-0.5 font-sans text-[10px] tabular-nums text-white/45">
            {formatJoinedLine(joinedAt, now)}
          </p>
        )}
      </div>
    </div>
  );
}
