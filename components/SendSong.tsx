"use client";

import { useEffect, useRef, useState } from "react";
import { SHARE_MESSAGES, buildShareUrl } from "@/lib/playerState";

export default function SendSong({
  songId,
  songTitle,
}: {
  songId: number;
  songTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCopiedIndex(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const send = async (messageIndex: number) => {
    const url = buildShareUrl(songId, messageIndex);
    const text = SHARE_MESSAGES[messageIndex];

    if (navigator.share) {
      try {
        await navigator.share({ title: songTitle, text, url });
        setOpen(false);
        return;
      } catch {
        // user cancelled the native share sheet — fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(messageIndex);
      setTimeout(() => {
        setCopiedIndex(null);
        setOpen(false);
      }, 1400);
    } catch {
      // clipboard blocked — leave the panel open so they can select manually
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label="Send this mehfil to someone"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
          open ? "text-brass-bright" : "text-white/60"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2 11 13" />
          <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
        </svg>
      </button>

      {open && (
        <div className="glass absolute bottom-full right-0 z-40 mb-2 w-64 rounded-2xl p-3">
          <p className="px-1 pb-2 font-sans text-[12px] font-semibold text-parchment">
            Send this Mehfil to someone ❤️
          </p>
          <p className="px-1 pb-2 font-sans text-[11px] text-white/50">
            {songTitle}
          </p>
          <div className="flex flex-col gap-1.5">
            {SHARE_MESSAGES.map((msg, i) => (
              <button
                key={msg}
                type="button"
                onClick={() => send(i)}
                className="rounded-xl bg-white/5 px-3 py-2 text-left font-sans text-[12.5px] text-parchment/90 transition-colors hover:bg-white/10"
              >
                {copiedIndex === i ? "Link copied ✓" : `"${msg}"`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
