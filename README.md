# The Rajmahal Palace

An ultra-premium, scroll-driven concept site for a fictional lake-palace hotel.

## Run locally

Install dependencies, then run the development server. The production build is created with the project’s `build` script.

## Video assets

Create `public/assets/video/` and place these files there:

- `01-hero-aerial.mp4`
- `02-arrival-gate.mp4`
- `03-durbar-lobby.mp4`
- `04-royal-suite.mp4`
- `05-pool-gardens.mp4`
- `06-night-finale.mp4`
- `poster.jpg`

Missing files automatically fall back to the deep-sapphire animated treatment and are logged in the browser console.

For reliable scroll seeking, re-encode clips 01, 02, and 06 with dense keyframes:

```bash
ffmpeg -i in.mp4 -vf scale=1920:-2 -g 1 -crf 20 -movflags +faststart -an out.mp4
```

## Adjusting scrub distance

In `app/page.tsx`, find the three `scrubVideo()` calls. The second number controls each chapter’s scroll distance as a percentage (for example, `380` is approximately `380vh`).

## Test checklist

- Chrome desktop: video seeking, Lenis inertia, pinned chapters, hover states
- Safari desktop: pin spacing, scroll restoration, video seek readiness
- iOS Safari: poster/Ken Burns fallback, autoplay loops, no horizontal overflow
- Reduced Motion enabled: no heavy pinning or scrubbing, readable static flow
