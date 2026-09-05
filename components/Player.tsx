"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { songs, formatTime } from "@/lib/songs";
import Vinyl from "./Vinyl";
import SeekBar from "./SeekBar";
import Transport from "./Transport";
import SleepTimer from "./SleepTimer";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(songs[0].duration);
  const [audioMissing, setAudioMissing] = useState(false);

  const song = songs[index];

  // Load the track whenever the index changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioMissing(false);
    setElapsed(0);
    setDuration(song.duration); // fallback until real metadata arrives
    audio.src = song.src;
    audio.load();
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
      setIndex((i) => (i + 1) % songs.length);
    };
    const onError = () => {
      // No file at /public/audio/<slug>.mp3 yet — keep the UI alive
      // (silent) instead of breaking playback controls.
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
  }, []);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + songs.length) % songs.length);
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % songs.length);
  }, []);

  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const sleepExpire = useCallback(() => setIsPlaying(false), []);

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
          <Transport
            isPlaying={isPlaying}
            onPrev={goPrev}
            onToggle={toggle}
            onNext={goNext}
          />
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
