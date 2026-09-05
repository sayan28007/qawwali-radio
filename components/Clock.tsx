"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
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
      </div>
    </div>
  );
}
