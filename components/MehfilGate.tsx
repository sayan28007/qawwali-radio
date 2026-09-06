"use client";

import { useEffect, useState } from "react";

function greeting(hour: number): string {
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

export default function MehfilGate() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [greetingText, setGreetingText] = useState("Good Evening");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setGreetingText(greeting(new Date().getHours()));
    // Skip the ritual on repeat visits within the same tab session —
    // once is enough, the second time it'd just be an annoying click.
    if (typeof window !== "undefined" && sessionStorage.getItem("mehfil-entered")) {
      setVisible(false);
    }
    setMounted(true);
  }, []);

  const enter = () => {
    setLeaving(true);
    // Dispatched synchronously inside this click handler, so any
    // audio.play() a listener calls is still within the user-gesture
    // call stack and won't be blocked by autoplay policies.
    window.dispatchEvent(new Event("mehfil-start"));
    try {
      sessionStorage.setItem("mehfil-entered", "1");
    } catch {
      // ignore (e.g. private browsing storage restrictions)
    }
    setTimeout(() => setVisible(false), 900);
  };

  if (!mounted || !visible) return null;

  return (
    <button
      type="button"
      onClick={enter}
      aria-label="Enter the mehfil"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-ink text-center transition-opacity duration-[900ms] ease-in-out ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span className="font-sans text-[13px] uppercase tracking-[0.2em] text-brass-bright/80">
        {greetingText}
      </span>
      <span className="font-display text-[26px] font-semibold italic text-parchment sm:text-[32px]">
        The Mehfil has begun.
      </span>
      <span className="font-sans text-[13.5px] text-white/60 sm:text-[14.5px]">
        Take a seat. Let the music speak.
      </span>
      <span className="mt-6 font-sans text-[11px] uppercase tracking-[0.15em] text-white/35">
        Tap to enter
      </span>
    </button>
  );
}
