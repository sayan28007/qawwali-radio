"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { songs, formatTime } from "@/lib/songs";
import { readProgress, readSharedIntent, saveProgress } from "@/lib/playerState";
import Vinyl from "./Vinyl";
import SeekBar from "./SeekBar";
import Transport from "./Transport";
import SleepTimer, { type SleepSelection } from "./SleepTimer";
import QueuePanel from "./QueuePanel";
import SendSong from "./SendSong";

type RepeatMode = "off" | "all" | "one";
type SleepMode = "off" | "duration" | "end-of-song" | "sunrise";

const HISTORY_LIMIT = 30;
const PROGRESS_SAVE_INTERVAL_MS = 5000;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQueue(currentIdx: number, shuffleOn: boolean): number[] {
  const rest: number[] = [];
  for (let i = 1; i < songs.length; i++) {
    rest.push((currentIdx + i) % songs.length);
  }
  return shuffleOn ? shuffleArray(rest) : rest;
}

function msUntilNextSunrise(): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(5, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

/** Shared links take priority; otherwise resume saved progress; otherwise start fresh. */
function getInitialPlaybackState(): { index: number; elapsedSec: number } {
  const shared = readSharedIntent();
  if (shared) {
    const idx = shared.songId - 1;
    if (idx >= 0 && idx < songs.length) return { index: idx, elapsedSec: 0 };
  }
  const progress = readProgress();
  if (progress) {
    const idx = progress.songId - 1;
    if (idx >= 0 && idx < songs.length) {
      return { index: idx, elapsedSec: progress.elapsedSec };
    }
  }
  return { index: 0, elapsedSec: 0 };
}

function ShuffleButton({ active, onClick }: { active: boolean; onClick: () => void }) {
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

function RepeatButton({ mode, onClick }: { mode: RepeatMode; onClick: () => void }) {
  const label = mode === "off" ? "Repeat off" : mode === "all" ? "Repeat all" : "Repeat one";
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

function QueueButton({ open, count, onClick }: { open: boolean; count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Queue"
      aria-pressed={open}
      onClick={onClick}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
        open ? "text-brass-bright" : "text-white/60"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M4 6h11M4 12h11M4 18h6" />
        <path d="M16 15l3 3 3-3" />
        <path d="M19 9v9" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brass-bright text-[8px] font-bold leading-none text-ink">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

export default function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialRef = useRef(getInitialPlaybackState());

  const [currentIndex, setCurrentIndex] = useState(initialRef.current.index);
  const [queue, setQueue] = useState<number[]>(() => buildQueue(initialRef.current.index, false));
  const [history, setHistory] = useState<number[]>([]);
  const [queueOpen, setQueueOpen] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(songs[initialRef.current.index].duration);
  const [audioMissing, setAudioMissing] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  const [sleepMode, setSleepMode] = useState<SleepMode>("off");
  const [sleepDeadline, setSleepDeadline] = useState<number | null>(null);
  const [sleepDisplaySec, setSleepDisplaySec] = useState<number | null>(null);

  const retryCountRef = useRef(0);
  const isPlayingRef = useRef(false);
  const repeatModeRef = useRef<RepeatMode>("off");
  const sleepModeRef = useRef<SleepMode>("off");
  const currentSongSrcRef = useRef(songs[initialRef.current.index].src);
  const shuffleRef = useRef(shuffle);
  const pendingSeekRef = useRef(initialRef.current.elapsedSec);
  const isFirstLoadRef = useRef(true);
  const elapsedRef = useRef(0);
  const currentIndexRef = useRef(currentIndex);

  const song = songs[currentIndex];
  isPlayingRef.current = isPlaying;
  repeatModeRef.current = repeatMode;
  sleepModeRef.current = sleepMode;
  currentSongSrcRef.current = song.src;
  shuffleRef.current = shuffle;
  elapsedRef.current = elapsed;
  currentIndexRef.current = currentIndex;

  const advance = useCallback(() => {
    setHistory((h) => [currentIndex, ...h].slice(0, HISTORY_LIMIT));
    setQueue((q) => {
      if (q.length > 0) {
        const [nextIdx, ...rest] = q;
        setCurrentIndex(nextIdx);
        return rest;
      }
      if (repeatModeRef.current === "off" && !shuffleRef.current) {
        setIsPlaying(false);
        return q;
      }
      const fresh = buildQueue(currentIndex, shuffleRef.current);
      const [nextIdx, ...rest] = fresh;
      setCurrentIndex(nextIdx);
      return rest;
    });
  }, [currentIndex]);

  // Load the track whenever the current song changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioMissing(false);
    setElapsed(0);
    setDuration(song.duration);
    audio.src = song.src;
    audio.load();
    retryCountRef.current = 0;
    if (isPlaying) {
      audio.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handoff from the entry gate: dismissing it is a genuine user gesture,
  // so starting playback here is allowed by autoplay policy.
  useEffect(() => {
    const onStart = () => setIsPlaying(true);
    window.addEventListener("mehfil-start", onStart);
    return () => window.removeEventListener("mehfil-start", onStart);
  }, []);

  // Persist "continue listening" progress periodically and on pause/unload.
  useEffect(() => {
    const save = () => saveProgress(currentIndexRef.current + 1, elapsedRef.current);
    const id = setInterval(() => {
      if (isPlayingRef.current) save();
    }, PROGRESS_SAVE_INTERVAL_MS);
    window.addEventListener("beforeunload", save);
    return () => {
      clearInterval(id);
      window.removeEventListener("beforeunload", save);
      save();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setElapsed(audio.currentTime);
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      // Resume from saved progress exactly once, on the very first track
      // this component loads (a shared link or a mid-song continue).
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
        const seekTo = pendingSeekRef.current;
        if (seekTo > 0 && Number.isFinite(audio.duration) && seekTo < audio.duration) {
          audio.currentTime = seekTo;
          setElapsed(seekTo);
        }
      }
    };

    const onEnded = () => {
      if (sleepModeRef.current === "end-of-song") {
        setIsPlaying(false);
        setSleepMode("off");
        setSleepDeadline(null);
        return;
      }
      if (repeatModeRef.current === "one") {
        setElapsed(0);
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      advance();
    };

    const onError = () => {
      const err = audio.error;
      const isRealMissingFile = err?.code === 3 || err?.code === 4;
      if (!isRealMissingFile && retryCountRef.current < 3) {
        retryCountRef.current += 1;
        const resumeAt = audio.currentTime;
        setTimeout(() => {
          audio.src = currentSongSrcRef.current;
          audio.load();
          audio.currentTime = resumeAt;
          if (isPlayingRef.current) audio.play().catch(() => {});
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
  }, [advance]);

  useEffect(() => {
    if (sleepDeadline == null) {
      setSleepDisplaySec(null);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.round((sleepDeadline - Date.now()) / 1000));
      setSleepDisplaySec(remaining);
      if (remaining <= 0) {
        setIsPlaying(false);
        setSleepMode("off");
        setSleepDeadline(null);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sleepDeadline]);

  const goNext = useCallback(() => advance(), [advance]);

  const goPrev = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) {
        setQueue((q) => [currentIndex, ...q]);
        setCurrentIndex((i) => (i - 1 + songs.length) % songs.length);
        return h;
      }
      const [last, ...rest] = h;
      setQueue((q) => [currentIndex, ...q]);
      setCurrentIndex(last);
      return rest;
    });
  }, [currentIndex]);

  const jumpTo = useCallback(
    (songId: number) => {
      const targetIdx = songId - 1;
      setQueue((q) => {
        const pos = q.indexOf(targetIdx);
        if (pos === -1) return q;
        setHistory((h) => [currentIndex, ...h].slice(0, HISTORY_LIMIT));
        setCurrentIndex(targetIdx);
        return q.slice(pos + 1);
      });
      setQueueOpen(false);
    },
    [currentIndex]
  );

  const reorderQueue = useCallback((fromPos: number, toPos: number) => {
    setQueue((q) => {
      if (toPos < 0 || toPos >= q.length) return q;
      const next = [...q];
      const [item] = next.splice(fromPos, 1);
      next.splice(toPos, 0, item);
      return next;
    });
  }, []);

  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      const next = !s;
      setQueue(buildQueue(currentIndex, next));
      return next;
    });
  }, [currentIndex]);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, []);

  const handleSleepSelect = useCallback((selection: SleepSelection) => {
    if (selection.type === "off") {
      setSleepMode("off");
      setSleepDeadline(null);
      return;
    }
    if (selection.type === "duration") {
      setSleepMode("duration");
      setSleepDeadline(Date.now() + selection.minutes * 60_000);
      return;
    }
    if (selection.type === "sunrise") {
      setSleepMode("sunrise");
      setSleepDeadline(Date.now() + msUntilNextSunrise());
      return;
    }
    if (selection.type === "end-of-song") {
      setSleepMode("end-of-song");
      setSleepDeadline(null);
    }
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

  const sleepLabel =
    sleepMode === "end-of-song"
      ? "End of song"
      : sleepDisplaySec != null
      ? `${Math.floor(sleepDisplaySec / 60)}:${String(sleepDisplaySec % 60).padStart(2, "0")}`
      : null;

  const upNextSongs = useMemo(() => queue.map((i) => songs[i]).slice(0, 50), [queue]);
  const historySongs = useMemo(() => history.map((i) => songs[i]), [history]);

  return (
    <div className="pointer-events-auto relative w-full max-w-xl">
      <audio ref={audioRef} preload="metadata" />

      <QueuePanel
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        upNext={upNextSongs}
        history={historySongs}
        onJump={jumpTo}
        onReorder={reorderQueue}
      />

      {audioMissing && (
        <p className="mb-2 text-center font-sans text-[11px] text-white/50">
          No audio file found for this track yet — drop{" "}
          <span className="font-mono text-white/70">public/audio/{song.slug}.mp3</span>{" "}
          into the project.
        </p>
      )}

      {/* ---------- Desktop: single horizontal glass pill ---------- */}
      <div className="glass hidden items-center gap-4 rounded-full p-3 pr-5 sm:flex">
        <Vinyl isPlaying={isPlaying && !audioMissing} size={80} />

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-semibold text-parchment">{song.title}</p>
          <p className="truncate font-sans text-[12.5px] text-white/70">{song.artist}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <SeekBar progress={progress} onSeek={seek} />
          </div>
          <div className="mt-0.5 flex items-center justify-between font-sans text-[10.5px] tabular-nums text-white/55">
            <span>{formatTime(elapsed)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <SleepTimer active={sleepMode !== "off"} label={sleepLabel} onSelect={handleSleepSelect} />
          <div className="flex items-center gap-0.5">
            <SendSong songId={song.id} songTitle={song.title} />
            <QueueButton open={queueOpen} count={upNextSongs.length} onClick={() => setQueueOpen((o) => !o)} />
            <ShuffleButton active={shuffle} onClick={toggleShuffle} />
            <RepeatButton mode={repeatMode} onClick={cycleRepeat} />
            <Transport isPlaying={isPlaying} onPrev={goPrev} onToggle={toggle} onNext={goNext} />
          </div>
        </div>
      </div>

      {/* ---------- Mobile: stacked glass card ---------- */}
      <div className="glass flex flex-col items-center gap-3 rounded-[28px] px-5 pb-4 pt-5 sm:hidden">
        <Vinyl isPlaying={isPlaying && !audioMissing} size={92} />

        <div className="w-full min-w-0 text-center">
          <p className="truncate font-display text-[16px] font-semibold text-parchment">{song.title}</p>
          <p className="truncate font-sans text-[12.5px] text-white/70">{song.artist}</p>
        </div>

        <div className="w-full">
          <SeekBar progress={progress} onSeek={seek} />
          <div className="mt-0.5 flex items-center justify-between font-sans text-[10.5px] tabular-nums text-white/55">
            <span>{formatTime(elapsed)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <SendSong songId={song.id} songTitle={song.title} />
          <QueueButton open={queueOpen} count={upNextSongs.length} onClick={() => setQueueOpen((o) => !o)} />
          <ShuffleButton active={shuffle} onClick={toggleShuffle} />
          <RepeatButton mode={repeatMode} onClick={cycleRepeat} />
        </div>

        <div className="flex items-center gap-3">
          <SleepTimer active={sleepMode !== "off"} label={sleepLabel} onSelect={handleSleepSelect} />
          <Transport isPlaying={isPlaying} onPrev={goPrev} onToggle={toggle} onNext={goNext} />
        </div>
      </div>
    </div>
  );
}
