"use client";

import { useEffect, useState } from "react";

type Period =
  | "sunrise"
  | "morning"
  | "noon"
  | "afternoon"
  | "evening"
  | "sunset"
  | "night"
  | "midnight";

function periodForHour(hour: number): Period {
  if (hour >= 5 && hour < 7) return "sunrise";
  if (hour >= 7 && hour < 11) return "morning";
  if (hour >= 11 && hour < 14) return "noon";
  if (hour >= 14 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 19) return "evening";
  if (hour >= 19 && hour < 20) return "sunset";
  if (hour >= 20 && hour < 24) return "night";
  return "midnight"; // 0–5
}

export default function TimeOfDayBackground() {
  // Default to "night" for the server-rendered frame — matches the
  // original dark aesthetic until the client can read the real clock,
  // so there's no flash of the wrong mood on first paint.
  const [period, setPeriod] = useState<Period>("night");

  useEffect(() => {
    const update = () => setPeriod(periodForHour(new Date().getHours()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`hero-bg hero-bg-${period} fixed inset-0 -z-20 transition-opacity duration-[1500ms]`}
      suppressHydrationWarning
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/55" />
    </div>
  );
}
