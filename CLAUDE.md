# CLAUDE.md — Whack The Corruptor

Satirical anti-corruption mobile web clicker. Garuda Hacks 7.0, Safety track, target award: **Most Unique Idea** (NOT Best Technical). ~2-day build, 4-person team. Small polished loop > big janky game.

## Source of truth & precedence
- Full docs live in `docs/` (GDD, PROJECT_MANIFEST, Technical_Constraints, Coding_Rules, UI_Rules, Definition_of_Done, Folder_Structure) + `docs/wireframes/`.
- **`docs/` GDD is v1 and partially stale. Where it conflicts with THIS file, THIS FILE WINS** (locations, currency, boss numbers, nav tabs were all decided after GDD v1).
- If you hit a conflict or an undefined rule: **flag it and ask — never silently resolve.**

## Commands
- `npm run dev -- --host` — dev server exposed on LAN (for real-phone testing)
- `npm run build` — must always stay green
- `npm run lint` / `npm run typecheck` — must pass before any commit

## Stack (locked — never add alternatives, never install unlisted deps without asking)
React 19 · TypeScript · Vite · Tailwind · Zustand · Motion.
**FORBIDDEN:** react-router, Redux, Next.js, Context API (unless truly unavoidable), Pixi/Phaser/any canvas engine, backend, auth, external API calls, databases, runtime AI inference, payments, multiplayer. Everything client-side; persistence via localStorage only; deploys as a static site (Vercel).

## Architecture invariants (non-negotiable)
1. **Sim layer vs UI layer separation.** Entity motion (coins, citizens, damage numbers, FX) is driven imperatively — Motion values / refs / rAF — NEVER through React state per frame. Zustand holds aggregate numbers only; components subscribe via narrow selectors.
2. **Exactly ONE code path may increase `recoveredMoney`: a citizen collecting a coin.** Never on tap, never on subdue. This is the game's identity — protect it.
3. **Object pooling** for all runtime entities (coins, citizens, damage numbers, hit FX). Never mount/unmount DOM nodes per entity.
4. **Hard caps:** ~12 coins on screen, 4–6 citizens, ~8 damage numbers. Overflow damage value banks numerically and pays out through collections — displayed numbers stay honest.
5. **Animate `transform` + `opacity` only.** Never top/left/width/height. No box-shadow/filter on animated nodes.
6. **Mobile hardening stays in from commit 1:** viewport meta anti-zoom, `touch-action: manipulation`, `user-select: none`, `overscroll-behavior: none`. Rapid tap must never trigger double-tap zoom.
7. **No router.** Screens/sheets = Zustand ui state. `pages/` holds screen shells toggled by state.
8. **Content is data.** All corruptors/weapons/locations/punishments/tuning live in typed files under `src/data/` — never inline in components. Tuning constants (caps, speeds, spawn rules, formulas) centralized in one tuning file.
9. **Save = one versioned localStorage util** with safe parse (corrupt/missing → new game). Persist wallet + unlocks + weaponLevels + progress + settings. Never persist runtime entities.
10. **Audio:** single sound manager; unlock AudioContext on first user tap; SFX small and preloaded; mute toggle in Settings.

## Locked game design decisions
- **Dual currency.** `Uang Rakyat` (Recovered People's Money) = hero score — biggest number on screen, only ever increases, NEVER spent. `Justice Points (JP)` = spendable on weapons/punishments, rendered smaller.
- **Total recovered per corruptor == `amountStolen` exactly.** Coins are fractions of it; when fully collected, the books balance.
- **8 locations, in order:** Sekolah → Balai RT → Kantor Desa → Kantor Kecamatan → Kantor Pemerintah Daerah → Gedung BUMN → Kementerian → Pengadilan Tipikor (final boss).
- **Progression is strictly linear.** No revisiting/farming previous locations. Weapon tiers must be purchased in order.
- **Weapons:** tier ladder Tangan Kosong (x1, starter) → Sandal Emak (x1.5, 50 JP) → Palu Keadilan (x2, 150 JP) → Laporan Audit (x3, 400 JP) → Satgas Antikorupsi (x5, 1000 JP). PLUS per-weapon **leveling**: upgrade = +base damage on the active weapon, geometric JP cost. `weaponLevels` lives in PlayerState. No location-skinned weapon variants.
- **Boss:** huge HP + **20s countdown**; fail → boss escapes → defeat **10** normal corruptors to retry (boss returns at full HP). Boss button is a state machine: `hidden/locked → available → active(20s) → failed(gate countdown)` — never freely tappable.
- **Corruptors are SUBDUED, never killed.** No Game Over. Loop is endless.
- **Punishments are cosmetic + educational ONLY** in MVP: Penjara, Sita Aset, Kerja Sosial, Larangan Jabatan Seumur Hidup. No passive bonuses (that's P2). Unlock via JP (costs TBD — propose defaults at data phase and confirm).
- **Bottom nav = 3 tabs only:** Home, Senjata (Weapons), Hukuman (Punishments) — as bottom sheets (~76% height) over a dimmed battle scrim. **No Allies tab, no Profile tab.**
- **Case card:** non-blocking slide-in, max 1–2 lines (occupation + scheme) + kerugian amount, tap anywhere to start, auto-dismiss ≤2s. No "Read More", no long-form text, no character levels.
- **All player-facing text in Bahasa Indonesia.** Code, comments, commits in English.
- **All corruptors are FICTIONAL archetypes.** Never real people's names, likenesses, or identifiable parodies of real officials.

## Design / UX rules
- Portrait only, mobile-first, one-handed: high-frequency controls (tap target, Uang Rakyat, weapon/upgrade, nav) in the lower ⅔ thumb zone. 60 FPS target. Minimal text.
- Dark theme: zinc-950 base; amber = money, red = HP/damage, green = recovered counter.
- **Layout contract** (see `docs/wireframes/`): 4 zones — header (Uang Rakyat big + JP small), stage (corruptor + full-width HP bar; corruptor is the tap target at ~60–70% of play area), floor band (coins land, citizens collect), bottom bar (weapon + upgrade) above the 3-tab nav.
- **Greybox first:** colored blocks + emoji placeholders. Corruptor face swaps by HP% (😐 → 😟 → 😰 → 😵). Lock sprite slot dimensions early — final art is a pure asset swap at M8, zero layout rework.
- Juice is P0, not decoration: hit flash, screen shake (scaled to damage), floating damage numbers, coin pop, counter roll, core SFX (tap thud, coin ding, register tick, subdue sting).

## Definition of Done (amended for game context)
Typed, lint-clean, responsive, animated, reusable components. **Sound required on core game actions** (tap, coin drop, collect, subdue, purchase) — not on every UI element. **Loading state = one boot/asset preloader** (assets are WebP, initial payload budget ≤ ~3MB). Empty states only where meaningful (e.g., shop with insufficient JP).

## Milestones — work ONE at a time, stop at its gate, commit
M0 setup + mobile hardening + deploy → M1 greybox tap loop → M2 signature mechanic (coins → citizens → counter; **on-device 60fps go/no-go**) → M3 juice pass → M4 data pipeline → M5 economy + progression → M6 boss system → M7 screens + save → M8 art integration → M9 demo hardening (hidden debug panel: grant JP, jump location).
**Never start the next milestone unprompted. No "while I'm at it" work. No speculative features** — Allies, passive DPS, achievements, XP, skins, dailies, leaderboards are all out of scope.

## Workflow
- Commit at every milestone gate with a clear message; keep build green at all times.
- When corrected on a mistake, expect the rule to be added here so it never repeats.
- Real-phone verification (jank, tap feel, zoom bugs) is done by the human — surface anything you cannot verify yourself.
