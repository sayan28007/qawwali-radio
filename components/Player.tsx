"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { songs, formatTime } from "@/lib/songs";
import Vinyl from "./Vinyl";
import SeekBar from "./SeekBar";
import Transport from "./Transport";
import SleepTimer from "./SleepTimer";

type RepeatMode = "off" | "all" | "one";

function ShuffleButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Shuffle"
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
        active ? "text-brass-bright" : "text-white/60"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h3.5c1.5 0 2.4.6 3.2 1.7L15 16c.8 1.1 1.7 1.7 3.2 1.7H21" />
        <path d="M17.5 4.5 21 8l-3.5 3.5" />
        <path d="M3 18h3.5c1.5 0 2.4-.6 3.2-1.7l.6-.85" />
        <path d="M13.9 8.55l.6-.85C15.3 6.6 16.2 6 17.7 6H21" />
        <path d="M17.5 19.5 21 16l-3.5-3.5" />
      </svg>
    </button>
  );
}

function RepeatButton({
  mode,
  onClick,
}: {
  mode: RepeatMode;
  onClick: () => void;
}) {
  const label =
    mode === "off" ? "Repeat off" : mode === "all" ? "Repeat all" : "Repeat one";
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
        mode !== "off" ? "text-brass-bright" : "text-white/60"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2.5 20 5.5l-3 3" />
        <path d="M20 5.5H8a5 5 0 0 0-5 5v1" />
        <path d="M7 21.5 4 18.5l3-3" />
        <path d="M4 18.5h12a5 5 0 0 0 5-5v-1" />
      </svg>
      {mode === "one" && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-ink text-[8px] font-bold leading-none text-brass-bright">
          1
        </span>
      )}
    </button>
  );
}

export default function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(songs[0].duration);
  const [audioMissing, setAudioMissing] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  const retryCountRef = useRef(0);
  const songRef = useRef(songs[0]);
  const isPlayingRef = useRef(false);
  const shuffleRef = useRef(false);
  const repeatModeRef = useRef<RepeatMode>("off");
  const indexRef = useRef(0);

  const song = songs[index];
  songRef.current = song;
  isPlayingRef.current = isPlaying;
  shuffleRef.current = shuffle;
  repeatModeRef.current = repeatMode;
  indexRef.current = index;

  const pickRandomIndex = useCallback((excludeIndex: number) => {
    if (songs.length <= 1) return excludeIndex;
    let next = excludeIndex;
    while (next === excludeIndex) {
      next = Math.floor(Math.random() * songs.length);
    }
    return next;
  }, []);

  // Load the track whenever the index changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioMissing(false);
    setElapsed(0);
    setDuration(song.duration); // fallback until real metadata arrives
    audio.src = song.src;
    audio.load();
    retryCountRef.current = 0;
    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay can be blocked, or the file may not exist yet.
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Keep play/pause state in sync with the <audio> element.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setElapsed(audio.currentTime);
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      // Repeat one: replay the same track from the top.
      if (repeatModeRef.current === "one") {
        setElapsed(0);
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      const atLastTrack = indexRef.current === songs.length - 1;

      // Repeat off + shuffle off + last track finished: stop.
      if (repeatModeRef.current === "off" && !shuffleRef.current && atLastTrack) {
        setIsPlaying(false);
        return;
      }

      if (shuffleRef.current) {
        setIndex((i) => pickRandomIndex(i));
      } else {
        setIndex((i) => (i + 1) % songs.length);
      }
    };

    const onError = () => {
      const err = audio.error;
      // MediaError codes: 1=ABORTED, 2=NETWORK, 3=DECODE, 4=SRC_NOT_SUPPORTED
      // Only codes 3/4 reliably mean "this file doesn't exist or is invalid".
      // Codes 1/2 usually mean a network hiccup mid-stream — retry instead
      // of telling the person to add a file that's already there.
      const isRealMissingFile = err?.code === 3 || err?.code === 4;

      if (!isRealMissingFile && retryCountRef.current < 3) {
        retryCountRef.current += 1;
        const resumeAt = audio.currentTime;
        setTimeout(() => {
          audio.src = songRef.current.src;
          audio.load();
          audio.currentTime = resumeAt;
          if (isPlayingRef.current) {
            audio.play().catch(() => {});
          }
        }, 800);
        return;
      }

      setAudioMissing(true);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [pickRandomIndex]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + songs.length) % songs.length);
  }, []);

  const goNext = useCallback(() => {
    if (shuffleRef.current) {
      setIndex((i) => pickRandomIndex(i));
    } else {
      setIndex((i) => (i + 1) % songs.length);
    }
  }, [pickRandomIndex]);

  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const sleepExpire = useCallback(() => setIsPlaying(false), []);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, []);

  const seek = useCallback(
    (p: number) => {
      const audio = audioRef.current;
      const next = p * duration;
      setElapsed(next);
      if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = next;
      }
    },
    [duration]
  );

  const progress = duration > 0 ? elapsed / duration : 0;

  return (
    <div className="pointer-events-auto w-full max-w-xl">
      <audio ref={audioRef} preload="metadata" />

      {audioMissing && (
        <p className="mb-2 text-center font-sans text-[11px] text-white/50">
          No audio file found for this track yet — drop{" "}
          <span className="font-mono text-white/70">
            public/audio/{song.slug}.mp3
          </span>{" "}
          into the project.
        </p>
      )}

      {/* ---------- Desktop: single horizontal glass pill ---------- */}
      <div className="glass hidden items-center gap-4 rounded-full p-3 pr-5 sm:flex">
        <Vinyl isPlaying={isPlaying && !audioMissing} size={80} />

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-semibold text-parchment">
            {song.title}
          </p>
          <p className="truncate font-sans text-[12.5px] text-white/70">
            {song.artist}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <SeekBar progress={progress} onSeek={seek} />
          </div>
          <div className="mt-0.5 flex items-center justify-between font-sans text-[10.5px] tabular-nums text-white/55">
            <span>{formatTime(elapsed)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <SleepTimer onExpire={sleepExpire} />
          <div className="flex items-center gap-0.5">
            <ShuffleButton active={shuffle} onClick={toggleShuffle} />
            <RepeatButton mode={repeatMode} onClick={cycleRepeat} />
            <Transport
              isPlaying={isPlaying}
              onPrev={goPrev}
              onToggle={toggle}
              onNext={goNext}
            />
          </div>
        </div>
      </div>

      {/* ---------- Mobile: stacked glass card ---------- */}
      <div className="glass flex flex-col items-center gap-3 rounded-[28px] px-5 pb-4 pt-5 sm:hidden">
        <Vinyl isPlaying={isPlaying && !audioMissing} size={92} />

        <div className="w-full min-w-0 text-center">
          <p className="truncate font-display text-[16px] font-semibold text-parchment">
            {song.title}
          </p>
          <p className="truncate font-sans text-[12.5px] text-white/70">
            {song.artist}
          </p>
        </div>

        <div className="w-full">
          <SeekBar progress={progress} onSeek={seek} />
          <div className="mt-0.5 flex items-center justify-between font-sans text-[10.5px] tabular-nums text-white/55">
            <span>{formatTime(elapsed)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ShuffleButton active={shuffle} onClick={toggleShuffle} />
          <RepeatButton mode={repeatMode} onClick={cycleRepeat} />
        </div>

        <div className="flex items-center gap-3">
          <SleepTimer onExpire={sleepExpire} />
          <Transport
            isPlaying={isPlaying}
            onPrev={goPrev}
            onToggle={toggle}
            onNext={goNext}
          />
        </div>
      </div>
    </div>
  );
}
