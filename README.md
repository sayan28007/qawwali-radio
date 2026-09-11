# Mehfil — a late-night qawwali radio

A single-page nostalgia player built with Next.js App Router, TypeScript,
and Tailwind v4 (CSS-first config, no `tailwind.config.*`).

**Live site:** https://qawwali-radio.vercel.app/

## Run locally

```bash
npm install
npm run dev
```

Requires network access to fetch the Fraunces/Manrope font files at build
time (via `next/font/google`).

## Entry ritual

`components/MehfilGate.tsx` covers the screen on first load with a
greeting (time-of-day aware: Good Morning/Afternoon/Evening/Night) and a
short line of copy, then fades away on tap. That tap is also what starts
playback — browsers block autoplay without a user gesture, so the entry
screen doubles as the unlock. The copy adapts automatically:

- **Default visit** — "The Mehfil has begun. Take a seat. Let the music
  speak."
- **Returning visit with saved progress** — "Continue listening" + the
  track title.
- **Opened from a shared link** — "Someone sent you a mehfil" + the
  sender's chosen message.

Shown once per browser tab session (`sessionStorage`), not on every reload.

## Playlist, audio, and playback

`lib/songs.ts` holds all 51 titles in order, each with a deterministic
(seeded, not random) fallback duration so server/client renders never
mismatch before real audio metadata loads.

`components/Player.tsx` drives a real `<audio>` element — play/pause/seek,
shuffle, and three repeat modes (off / all / one) all come from actual
playback, not a simulated clock. Each song looks for its file at a fixed
path: `public/audio/<slug>.mp3`. To add or replace a track, see
`public/audio/README.md` for the exact expected filename per song — drop
the MP3 in with that name and it works, no code changes. A track missing
its file shows a small "no audio yet" note under the player without
breaking anything else. Audio errors are triaged before showing that
note: genuine 404s show it, but a mid-stream network hiccup silently
retries (up to 3 times) instead of falsely claiming the file is missing.

Queueing is a real, reorderable queue (`components/QueuePanel.tsx`), not
index arithmetic — shuffle rebuilds it, repeat-all refills it when empty,
skip-ahead splices it. The panel has four tabs:

- **Up Next** — reorder with the up/down arrows, tap any title to jump.
- **History** — everything played this session, most recent first. Also
  surfaced passively as a one-line "Earlier in this Mehfil" strip under
  the player, so it's visible without opening the panel.
- **All Songs** — the full 51-track catalog, sorted A–Z.
- **Liked** — hearted tracks only.

Every row across all four tabs has a heart toggle
(`lib/likedSongs.ts`, stored in `localStorage`).

## Continue listening & sharing

`lib/playerState.ts` persists playback position to `localStorage` every
few seconds and on tab close, so returning within 14 days resumes exactly
where it left off (surfaced via the entry gate's "Continue listening"
copy above).

`components/SendSong.tsx` builds a shareable link to the current track
(`?song=<id>&msg=<0|1>`) with one of two preset messages ("I thought you
might like this." / "Listen to this qawwali."). Uses the native share
sheet where available, otherwise copies the link to the clipboard.
Opening a shared link jumps straight to that track and shows the
sender's message on the entry gate.

## Sleep timer

`components/SleepTimer.tsx` offers 5/15/30/45/60-minute presets plus two
context-aware options: **end of current song** and **at sunrise**
(computed against the next 5:00 AM local time — ties directly into the
time-of-day background system below).

## Time-of-day background

`components/TimeOfDayBackground.tsx` reads the local hour on mount and
swaps between eight mood classes defined in `app/globals.css`
(`hero-bg-sunrise` through `hero-bg-midnight`), each with a landscape and
a portrait image. File naming convention: `public/bg/<period>-wide.jpg`
and `public/bg/<period>-tall.jpg` for sunrise, morning, noon, afternoon,
evening, sunset, night, midnight. Rechecks every 60 seconds so a session
left open crosses into the next period on its own.

## Listening stats

`lib/stats.ts` tracks total listening time, per-song time and play counts,
an hour-of-day histogram, and monthly totals — all in `localStorage`, no
account needed. `components/StatsCard.tsx` ("Your Mehfil Stats") surfaces
total time, top 10 songs, most replayed track, most-played hour, longest
session, and a 6-month bar chart. Top Artists was deliberately left out —
every track is credited to "Traditional Qawwali", so that stat would
always read 100% one artist.

## Radio-station touches

- **On Air badge** — a small pulsing indicator near the track title,
  visible at all times.
- **Now Playing flash** — replaces the On Air badge for 2.5s whenever the
  track changes (not on first load).
- **Next-track countdown** — under the elapsed/duration readout, a live
  line that reads "Next in 04:12", and adapts contextually: "Repeats in…"
  under repeat-one, "Ending in…" when the sleep timer is set to end of
  song, "Mehfil ends in…" on the last track with no repeat/shuffle to
  carry it forward.
- **"You joined at…"** — under the clock (top-left), a live line showing
  join time and elapsed session length for the current tab session.

## Media Session integration

`components/Player.tsx` wires up the browser's Media Session API — lock
screen and notification-shade controls (play/pause/next/prev), track
title/artist, and cover art all work from the OS media widget, and
playback stays controllable even when the tab isn't focused. No extra
dependency; it's a native browser API.

## Motion

`components/Transition.tsx` is a small reusable fade+scale mount/unmount
wrapper (no animation library) used by the queue panel, stats card, sleep
timer menu, and send-a-song menu, so those open and close smoothly rather
than popping instantly.

## Assets

- `public/bg/` — eight time-of-day backgrounds (see above), each as a
  landscape/portrait pair.
- `public/cover/station.jpg` — square crop used as the vinyl's label art
  and as Media Session artwork. This is a single-station radio, so one
  badge of art covers the whole stream rather than 51 individual
  per-track covers.

## Design notes

- Accent is a brass/marigold gold (`--color-brass-bright`, `#f0c069`),
  pulled from the instruments and garlands in the artwork rather than a
  generic UI blue.
- Track titles are set in Fraunces (serif, a little handwritten warmth);
  everything else — clock, listener count, artist line, time codes — is
  Manrope, so the song title is the one thing given typographic weight.
- `components/Player.tsx` renders two genuinely separate trees
  (`hidden sm:flex` / `sm:hidden`) for desktop and mobile, not one
  reflowing layout.
- All fixed elements (clock, listener count, socials, player) resolve
  their edge offsets through `max(1rem, env(safe-area-inset-*))`, checked
  per side (left ≠ right) rather than reusing one inset value on both
  sides.

## Deployment

Hosted on Vercel's Hobby (free) tier, connected to GitHub for automatic
deployment on every push to `main`. Personal, non-commercial use — Vercel's
free tier terms don't cover commercial projects.
