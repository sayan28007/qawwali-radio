"use client";

import { useEffect, useState } from "react";
import { songs } from "@/lib/songs";
import { readProgress, readSharedIntent, SHARE_MESSAGES } from "@/lib/playerState";

function greeting(hour: number): string {
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

type Copy = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

function resolveCopy(): Copy {
  const shared = readSharedIntent();
  if (shared) {
    const song = songs[shared.songId - 1];
    return {
      eyebrow: "Someone sent you a mehfil",
      title: SHARE_MESSAGES[shared.messageIndex],
      subtitle: song ? song.title : "A qawwali is waiting for you.",
    };
  }

  const progress = readProgress();
  if (progress) {
    const song = songs[progress.songId - 1];
    if (song) {
      return {
        eyebrow: greeting(new Date().getHours()),
        title: "Continue listening",
        subtitle: song.title,
      };
    }
  }

  return {
    eyebrow: greeting(new Date().getHours()),
    title: "The Mehfil has begun.",
    subtitle: "Take a seat. Let the music speak.",
  };
}

export default function MehfilGate() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [copy, setCopy] = useState<Copy | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCopy(resolveCopy());
    if (typeof window !== "undefined" && sessionStorage.getItem("mehfil-entered")) {
      setVisible(false);
    }
    setMounted(true);
  }, []);

  const enter = () => {
    setLeaving(true);
    window.dispatchEvent(new Event("mehfil-start"));
    try {
      sessionStorage.setItem("mehfil-entered", "1");
    } catch {
      // ignore
    }
    setTimeout(() => setVisible(false), 900);
  };

  if (!mounted || !visible || !copy) return null;

  return (
    <button
      type="button"
      onClick={enter}
      aria-label="Enter the mehfil"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-ink px-6 text-center transition-opacity duration-[900ms] ease-in-out ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span className="font-sans text-[13px] uppercase tracking-[0.2em] text-brass-bright/80">
        {copy.eyebrow}
      </span>
      <span className="font-display text-[26px] font-semibold italic text-parchment sm:text-[32px]">
        {copy.title}
      </span>
      <span className="font-sans text-[13.5px] text-white/60 sm:text-[14.5px]">
        {copy.subtitle}
      </span>
      <span className="mt-6 font-sans text-[11px] uppercase tracking-[0.15em] text-white/35">
        Tap to enter
      </span>
    </button>
  );
}
