# Whack The Corruptor

Satirical anti-corruption mobile web clicker — Garuda Hacks 7.0, Safety track.

Tap fictional corruptors until they are subdued. Stolen money bursts out, citizens
scramble to collect it, and only when the people recover it does `Uang Rakyat` rise.
The mechanic is the message.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev -- --host` | Dev server exposed on LAN (real-phone testing) |
| `npm run build` | Production build (static site, deploys to Vercel) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript project check |

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand · Motion.
No backend, no router — everything client-side, persistence via `localStorage`.

## Docs

Read `CLAUDE.md` first (it overrides stale parts of `docs/`), then `docs/` and
`wireframes/`.
