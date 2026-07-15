---
name: verify
description: Build, launch, and drive Whack The Corruptor in a headless browser to verify gameplay changes end-to-end.
---

# Verify — Whack The Corruptor

## Build & launch
- `npm install` if node_modules missing (lockfile may churn on different npm versions — restore with `git checkout -- package-lock.json` if untouched intentionally).
- Dev server: `npm run dev` (background) → http://localhost:5173. No `--host` needed for local driving.

## Drive (no browser automation deps in this repo — keep it that way)
- Install `playwright-core` in the session **scratchpad** dir, NEVER in the project (stack is locked; `npm i` in the wrong cwd modifies package.json — `Set-Location` failures fall through to project cwd, so verify cwd first).
- Launch system Edge: `chromium.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', headless: true })`.
- Context: `{ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }` — use `locator.tap()` (touch path), not click.
- Tap target: `getByRole('button', { name: /Tindak/ })`.

## Flows worth driving
- Tap loop: HP drops per tap, face swaps at HP% thresholds (tuning.ts `FACE_STAGES`), 0 HP → DIBEKUK overlay → auto-advance after `SUBDUED_DURATION_MS` → next corruptor full HP.
- Spam taps during DIBEKUK must be ignored (no negative HP, no double-advance). Note: Playwright taps are ~150ms apart, so a "spam during subdued" loop outlasts the 1.2s subdue window — trailing taps legitimately hit the next corruptor.
- INVARIANT check every run: header `Uang Rakyat` stays Rp0 until citizen coin collection exists (M2+); it must never move on tap or subdue.
- Capture `pageerror` + console errors; screenshot header/stage states as evidence.
