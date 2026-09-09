# Mehfil — a late-night qawwali radio

A single-page nostalgia player built with Next.js App Router, TypeScript,
and Tailwind v4 (CSS-first config, no `tailwind.config.*`).

**Live site:** https://qawwali-radio-zeta.vercel.app/

## Run locally

```bash
npm install
npm run dev
```

Requires network access to fetch the Fraunces/Manrope font files at build
time (via `next/font/google`).

## Playlist

`lib/songs.ts` holds all 50 titles in original order, with deterministic
(seeded, not random) fallback durations so server/client renders never
mismatch before real audio loads.

Audio is wired up for real — `components/Player.tsx` drives an actual
`<audio>` element (play/pause/seek/next/prev, elapsed time, and duration all
come from real playback, not a simulated clock). Each song looks for its
file at a fixed path: `public/audio/<slug>.mp3`.

To add or replace a track: see `public/audio/README.md` for the exact
expected filename per song. Drop the MP3 in with that name and it works, no
code changes needed. A track missing its file shows a small "no audio yet"
note under the player and the rest of the UI keeps working normally —
nothing breaks.

Only licensed or owned audio should be used here — see the note in
`public/audio/README.md`.

## Assets

- `public/bg/scene-wide.png` — landscape hero background.
- `public/bg/scene-tall.png` — portrait background for tall/rotated
  viewports. Currently a derived composition (blurred fill + a sharp crop of
  the lead singer) built from the landscape source rather than a separately
  art-directed piece — swap in a true portrait composition if one becomes
  available.
- `public/cover/station.jpg` — square crop used as the vinyl's label art.
  This is framed as a single-station radio, so one badge of art covers the
  whole stream rather than 50 individual per-track covers.

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
- All four fixed elements (clock, listener count, socials, player) resolve
  their edge offsets through `max(1rem, env(safe-area-inset-*))`, checked
  per side (left ≠ right) rather than reusing one inset value on both
  sides.
