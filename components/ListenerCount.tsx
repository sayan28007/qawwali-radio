"use client";

import { useEffect, useState } from "react";

const BASE = 612;

export default function ListenerCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(BASE);
    const id = setInterval(() => {
      setCount((c) => {
        const current = c ?? BASE;
        const drift = Math.round((Math.random() - 0.5) * 10);
        const next = current + drift;
        return Math.min(880, Math.max(340, next));
      });
    }, 3400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-30 -translate-x-1/2 select-none">
      <div className="glass flex items-center gap-2 rounded-2xl px-3.5 py-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brass-bright opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brass-bright" />
        </span>
        <span
          className="font-sans text-[12.5px] font-medium tabular-nums text-parchment/85"
          suppressHydrationWarning
        >
          {count ?? BASE} in the mehfil
        </span>
      </div>
    </div>
  );
}
