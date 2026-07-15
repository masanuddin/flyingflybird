# Whack The Corruptor — Game Design Document

**Event:** Garuda Hacks 7.0 · **Track:** Safety (Anti-Corruption Awareness) · **Award Target:** Most Unique Idea
**Platform:** Mobile-first Web · Single Player · React + TypeScript
**Build window:** ~2 days · **Team:** 4 (Ricky, Afla, Feli, Marcell)
**Doc status:** v1 — build-ready draft. Sections flagged `⚑ DECISION` need a call before/at kickoff.

---

## 1. One-Liner & Hook

> *You can't punch a real corruptor. So we built a game where you can — and every hit puts stolen money back in the people's hands.*

**Whack The Corruptor** is a satirical mobile clicker where you tap fictional corruptors until they're subdued. Money physically bursts out of them, citizen NPCs scramble to collect it, and only when the people grab it does your **Recovered People's Money** counter climb. You upgrade from bare hands → mom's sandal → an anti-corruption strike force, climbing from a village treasurer stealing Rp100 all the way to a national mega-scandal.

It's dumb-fun on the surface, but the core mechanic *is* the message. That's the whole play for "Most Unique Idea."

---

## 2. Design Pillars

Every design/scope decision gets checked against these four. If a feature doesn't serve a pillar, it's cut.

1. **The metaphor plays itself.** Stolen money → people collect it → counter rises. The anti-corruption message is delivered *through the mechanic*, never through text walls. If a judge understands the point without us explaining it, we win.
2. **Juice over features.** A small, satisfying, polished loop beats a big janky one. Game-feel (screen shake, coin pop, cash-register ticks, weapon impact) is a P0 requirement, not decoration.
3. **Satire, not violence or preaching.** Corruptors are *subdued*, not killed. Tone is humorous and cathartic. We never glorify violence and never lecture.
4. **Learning by osmosis.** Real corruption archetypes and their scale (the stolen amounts) teach themselves through gameplay. No textbook moments.

---

## 3. Positioning & Judging-Criteria Map

We are **not** chasing Best Overall. We're chasing *memorable*. Here's how the concept maps to the rubric so we build toward the score:

| Criterion | How we win it |
|---|---|
| **Innovation & Novelty** | The money→citizen→Recovered-Money mechanic. No one else in the room will have a game whose *scoring loop* is the metaphor. This is our strongest axis — lean into it hard. |
| **Presentation & Communication** | The demo *is* the pitch. A live, playable, funny loop is more memorable than any slide. We script the demo to land the "wow" in the first 15 seconds. |
| **User Experience & Design** | Mobile-first, thumb-friendly, heavy juice. One-tap onboarding. The screen reads instantly. |
| **Problem Definition** | Corruption apathy/fatigue in Indonesia — people feel powerless and disconnected from the scale of it. We give symbolic agency + visceral sense of scale. |
| **Impact & Feasibility** | **Be honest here.** Impact tier = *awareness + engagement*, not "solves corruption." Judges respect an honest frame. Feasibility is strong: it's a static web app, no backend, ships in 2 days. |
| **Market Fit / Viability** | Casual mobile-game audience × civic-tech/edu angle. Shareable, meme-able, low CAC. Realistic path: viral awareness tool / classroom civic-education toy. |
| **Technical Implementation** | Real-time entity system (spawning, physics-y coin drops, NPC steering, object pooling) running smoothly on mobile web, zero backend, live-deployed. Non-trivial to do *well*. |

**Pitch narrative in one breath:** "Corruption feels too big to fight, so we made it something you *can* fight — and the fun part isn't hitting the corruptor, it's watching the people get their money back."

---

## 4. Core Gameplay Loop

```
Case intro (who + what they stole)
   ↓
Tap corruptor → damage + hit juice
   ↓
Money bursts out → drops to floor
   ↓
Citizen NPCs run in → collect coins
   ↓
Recovered People's Money ticks up   ← the emotional beat
   ↓
Corruptor HP → 0 → "SUBDUED" (+ optional punishment animation)
   ↓
Rewards granted → next case / next corruptor
   ↓
Spend on stronger weapon → hit harder
   ↓
Boss (timed) → clear location → next location (bigger scandals)
   ↺ repeat, no Game Over
```

Moment-to-moment: pure tapping. No mana, no skills, no combos. Depth comes from *progression* (weapons, case scale, bosses), not input complexity. This is deliberate and correct — keep it.

---

## 5. ⭐ Signature Mechanic — Money Recovery (BUILD THIS FIRST)

This is the identity of the game and the single most important thing to get right. Spec it precisely for the dev who owns it.

**Flow per qualifying hit:**
1. On tap (or per damage threshold), spawn `K` coin sprites at the corruptor's chest position with a "pop" impulse — arc up, then fall to the floor under gravity. Land → become *collectable*.
2. A small pool of **citizen NPCs** idles at the bottom of the screen. When collectable coins exist, an idle citizen targets the **nearest** uncollected coin, runs to it (simple lerp/steering), grabs it (coin vanishes with a pickup pop + coin *ding*), then returns/exits.
3. **Recovered People's Money increments ONLY on citizen collection — never on tap.** This delay is the whole point: you don't get credit for hitting, you get credit when the people actually recover the money. Increment with a juicy counter roll + cash-register tick.

**Critical implementation rules:**
- **Object pooling** for coins *and* citizens (reuse sprites — never mount/unmount per coin). This is non-negotiable for mobile perf.
- **Cap on-screen coins** (~12). Extra damage still counts numerically — overflow value is banked and paid out as coins get collected, so the number stays honest without spawning 500 sprites.
- **Fewer, chunkier, juicier coins > a swarm of tiny ones.** Tune for satisfaction, not realism.
- **Visual escalation:** early game = literal single coins (Rp100 → one sad coin). National scandal = cash bundles / money bags / pallets. The *object that drops* reinforces the scale-progression fantasy for free.
- On **Subdued** while coins remain: citizens auto-finish collecting the floor before the corruptor is cleared (matches "citizens finish collecting remaining money").

If this mechanic feels good in a phone browser, we have a winning demo. If it doesn't, nothing else matters. **Prototype it in the first 3 hours.**

---

## 6. Corruptor System

**Data model** (drives everything — store cases as a typed data file, see §14):

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` | string | Fictional. See legal guardrails §12. |
| `occupation` | string | e.g. "Village Treasurer" |
| `case` | string | 1–2 line satirical description of the scheme |
| `amountStolen` | number | Drives the coin visual + reward scale |
| `hp` | number | |
| `reward` | { recovered: number; jp: number } | See economy §11 |
| `sprite` | asset ref | Base body + swappable head/prop (see art §13) |

**Per-tap feedback:** damage dealt · floating damage number · hit-spark/flash · screen shake (scaled to damage) · coin burst · corruptor expression shifts (calm → rattled → panicked → subdued). The expression progression is cheap juice with big payoff — 3–4 face states swapped by HP %.

**Defeat = "SUBDUED", never killed.** The player never kills. On HP→0: corruptor plays a subdued reaction → optional punishment animation → clears → rewards granted → next case slides in. **No Game Over, ever.** The loop is endless.

---

## 7. Progression & Locations

The fantasy is **climbing the corruption hierarchy** — small-time → national scandal. This gives the emotional arc.

**Location ladder:**
`Village Office → Subdistrict → District → Provincial Gov → State-Owned Enterprise → Ministry → National Mega-Cases`

Each location = unique background + atmosphere + its own roster of corruptors + one boss. Escalating stakes visible in the stolen amounts (Rp100 → hundreds of billions).

**Early-game economy (deliberately petty — this is where the comedy lives):**

| Corruptor | Stolen | HP |
|---|---|---|
| Village Treasurer | Rp100 | 100 |
| Neighborhood Treasurer | Rp250 | ~150 |
| School Committee | Rp500 | ~200 |
| Study Tour Organizer | Rp1.000 | ~300 |
| Village Secretary | Rp5.000 | ~500 |
| **Village Chief (BOSS)** | **Rp25.000.000** | **large** |

The jump from Rp5.000 to Rp25jt at the boss is intentional and funny — the "boss reveal" of how much the guy at the top actually took. Preserve that gag structure at every location: petty mooks, then a boss whose number makes you laugh/wince.

---

## 8. Boss Battles

Bosses = severe cases, and they *feel* different (tension spike):
- **Huge HP** + **countdown timer** — subdue before time expires.
- Effectively **gate-checks your weapon tier** — under-geared players can't clear in time.
- **Fail state:** boss *escapes* (thematically perfect — the big fish gets away). To retry, clear N normal corruptors first; boss returns at **full HP**.
- Payoff on win: big Recovered-Money explosion + a signature punishment animation.

This is the only place we introduce pressure, and that contrast is what makes the rest of the loop feel relaxing and the boss feel exciting.

---

## 9. Weapons & Damage

Weapons = the primary progression sink. No RPG classes — just linear power + visual/comedic escalation.

**Damage multiplier ladder:** `x1 → x1.5 → x2 → x3 → x5 → …`

**Weapon tiers (comedy is the point — keep the local flavor):**
`Bare Hands → Mother's Sandal (Sandal Emak) → Hammer of Justice → Audit Report → Anti-Corruption Strike Force → …`

Each tier should look and *hit* more satisfying than the last (bigger impact FX, better sound). "Mother's Sandal" and "Audit Report as a weapon" are exactly the kind of beats that make judges remember the game — lean into the satire.

---

## 10. Punishment System (Cosmetic + Educational)

After subduing, unlockable punishment animations play. **Cosmetic and educational — never violent.** They teach real consequences of corruption:
`Prison · Asset Confiscation · Community Service · Lifetime Public-Office Ban`

Tone stays humorous/satirical (think slapstick justice, not gore). These double as a light collection/unlock hook and reinforce "there are real consequences" without a lecture.

---

## 11. Rewards & Economy

⚑ **DECISION — currency model.** Your notes list Recovered Money + XP + Achievements. Recommendation: run **two numbers**, one hero + one spendable.

- **Recovered People's Money** — the **hero score**. Always the biggest number on screen. Only ever goes *up*. This is the win metric and the emotional core. **Never spent.**
- **Justice Points (JP)** *(or "Public Support")* — the **spendable** soft currency, earned per subdual, used to buy weapons + punishments. Deliberately rendered smaller/secondary.

Why two: if Recovered Money is *also* the upgrade currency, you're literally spending the people's recovered money on your own sandals — theme wrinkle. Splitting keeps "biggest number = Recovered Money" intact (your explicit rule) while giving the player something to spend, which is the classic idle-game dopamine loop. Cost: one extra counter. Cheap. **Recommend adopting.**

- **XP / Achievements:** for MVP, fold "progression" into Recovered-Money and JP thresholds (unlock next location / weapon). Treat standalone XP + achievements as **P2** — cut first if time is short.

Economy tuning philosophy: don't over-engineer a balance curve for a 2-day build. Hand-tune the **demo path** to feel great, use a simple formula (`hp` and `reward` scale ~geometrically per location) for the rest. Balance is a P2 concern; *feel* is P0.

---

## 12. Content & Legal Guardrails ⚠️

This matters — flagging it up front because it shapes all content:

- **All corruptors are fictional** — invented names, composite/parody archetypes "inspired by" real *types* of cases. **Do not name, caricature, or depict real living people** (defamation risk + it cheapens the satire). "Village Treasurer who bought a goat with the road-repair fund" > naming an actual official.
- Frame the educational layer as **archetypes of how corruption happens**, not accusations against individuals.
- Subdued-not-killed + justice-themed punishments keep us clear of "game about beating up people." Keep the message frame visible in the pitch: *symbolic catharsis + civic awareness.*

This keeps us safe legally **and** makes the satire sharper (archetypes are funnier and more universal than a specific name).

---

## 13. UX / UI & Art Direction

**Layout (portrait, thumb-first):**
- **Top:** Recovered People's Money (hero counter, huge). JP smaller beside/below.
- **Center:** the corruptor + HP bar. This is the tap target — big, centered, reachable.
- **Floor band (lower third):** where coins land + citizens roam. This zone *is* the metaphor — give it room.
- **Bottom bar:** current weapon + "Upgrade" button; punishments/location as secondary tabs.

**Onboarding:** zero tutorial. First screen = a tiny Rp100 corruptor + a finger-tap hint. One tap and the whole loop is self-evident.

⚑ **DECISION — art pipeline** (a real 2-day risk). Recommendation:
- Pick **one** simple style: **flat vector cartoon**. Fastest to produce, on-brand for satire, scales cleanly on mobile.
- **Corruptor rig trick:** one shared base body + swappable head / accessory / color per case (batik shirt, peci, briefcase, dark glasses). Lets you produce *many* corruptors from *little* art. This is the single biggest art-scope saver — do it.
- Coins + citizens = a handful of reusable sprites (pooled). Backgrounds = simple flat scenes per location.
- Sourcing options: free asset packs (e.g. Kenney), quick in-house vectors, or AI-generated 2D sprites (consistency is the catch — lock a style ref first). Decide fast; assets block everything downstream.

---

## 14. Technical Architecture

**Stack:** React + TypeScript + Tailwind. State: **Zustand** (clean central game store — money, JP, current corruptor, upgrades, location; less ceremony than Redux for a 2-day build).

⚑ **DECISION — rendering approach for the game layer.** The coin-burst + citizen-NPC swarm is the perf-critical part. Doing dozens of moving entities as React DOM components = re-render death. Three options:

| Option | Pros | Cons | When |
|---|---|---|---|
| **A. PixiJS canvas** for game entities, React DOM for UI overlay | Best juice + best perf; built for exactly this | Bundle size + learning curve in 2 days | If anyone on the team knows Pixi |
| **B. Plain HTML5 Canvas 2D** + manual game loop, React UI overlay | Lightweight, full control | You hand-build particle/tween/pooling helpers | If comfortable with canvas + rAF |
| **C. Pure DOM/CSS**, hard entity caps + object pooling + CSS-transform animations | Fastest for React-only devs | Jank risk if uncapped; less flashy | Default fallback |

**Recommendation:** if a team member is comfortable with **PixiJS → do A** (it makes the signature mechanic sing, which is the whole game). Otherwise default to **C with strict caps + pooling** and design coins to look great at low counts (§5). Decide inside the first 3-hour prototype: build the money mechanic, test on a **real phone**, and if DOM/CSS jitters at target coin counts, switch. Don't theorize — measure on-device early.

**Architecture notes:**
- **No backend.** Single-player, save via `localStorage`. Ship as a static site → **deploy to Vercel/Netlify**. This deletes a huge chunk of scope — keep it. (Leaderboards etc. → future, needs backend.)
- **Content as data:** corruptor cases live in a typed `corruptors.ts` (schema in §6), separated from code. Non-coders on the team (content/writing) can add cases without touching logic. This is how the "content-heavy educational" part stays cheap.
- **Structure:** `game store (Zustand)` ↔ `game canvas/entity layer` (owns coins/citizens/hits) ↔ `React UI overlay` (counters, menus, case cards). Clean seam between simulation and chrome.

---

## 15. 🎯 MVP Scope — What Ships in 2 Days

The most important section. Lock this at kickoff; defend it against scope creep.

**P0 — the demo does not exist without these:**
- Tap-to-damage on a corruptor + full hit juice (damage numbers, shake, flash, expression states)
- **The signature mechanic:** coin burst → citizens collect → Recovered Money ticks up (juicy). *This is the product.*
- HP bar → SUBDUED → next corruptor, endless loop
- Recovered People's Money as the hero counter
- ≥1 weapon upgrade that *visibly* increases damage
- **1 full location:** ~4–5 escalating corruptors + 1 boss
- Corruptor case card (name / occupation / case / amount) — the edu hook
- **Live deploy, mobile-responsive**

**P1 — makes it feel complete & demo-ready:**
- Boss timer mechanic (tension beat for the demo climax)
- 2–3 weapon tiers with visual change
- ≥1 punishment animation
- Progression into a **2nd location** (proves the "climb the hierarchy" fantasy on stage)
- **Sound:** tap thud, coin ding, cash-register counter tick — massive juice-per-effort, add it
- `localStorage` save

**P2 — cut first if time is tight:**
- Multiple punishments · achievements · standalone XP · more locations · extra polish

**Explicitly cut / fake for the demo:**
- Deep economy balancing (hand-tune only the demo path)
- Large case library (5–8 cases is plenty)
- All meta systems: allies, passive DPS, dailies, seasonal events, skins

---

## 16. 🎤 Demo & Pitch Strategy (where the award is won)

The award is decided in ~3 minutes on stage. Script it. Suggested flow:

1. **Open petty (get the laugh):** Village Treasurer, stole **Rp100**. One sad coin. Judges chuckle at the pettiness.
2. **First tap = the "wow" (do this in the first 15s):** coins fly → citizens scramble → Recovered counter ticks. *Say nothing.* Let them watch the metaphor land on its own. That silent beat is the whole pitch.
3. **Escalate fast:** climb cases, numbers grow, upgrade to **Mother's Sandal** (laugh), then **Audit Report** (bigger laugh).
4. **Boss climax:** national mega-case, timer ticking, tension → SUBDUE → punishment animation → Recovered Money **explodes** into the billions "returned to the people."
5. **Land the message (one line):** *"You just learned N real corruption archetypes and their real scale — without reading a single paragraph. That's the point."*

Then map it explicitly for judges: **Novelty** (the recovery mechanic) · **UX** (juice/mobile) · **Technical** (real-time entities on mobile web, zero backend, live URL) · **Impact** (awareness + civic engagement — stated honestly). Hand them a QR code to play it themselves. A judge who *plays* it remembers it.

---

## 17. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Perf/jank on mobile (coins + NPCs) | **High** | Object pooling, entity caps, test on a real phone in hour 3, Pixi if needed |
| Signature mechanic doesn't *feel* good | **High** | Build it first; prioritize game-feel over feature count; a small polished slice > big janky game |
| Scope creep eats the polish budget | **High** | Lock P0; timebox; every feature must serve a pillar (§2) |
| Art pipeline stalls everything | **Med** | Decide style + rig trick day 1; source assets in parallel with code |
| Tone misread (violence / making light of corruption) | **Med** | "Subdued not killed," justice-themed punishments, satire framing, message stated in pitch |
| Content/legal (real names) | **Med** | Fictional composites only (§12) |

---

## 18. ⚑ Team Build Plan (adapt to actual strengths)

4 people, ~2 days. Role-based split — assign by who's strongest where (I don't know Feli's stack, so slot people in):

- **Game-feel lead** — owns the §5 signature mechanic: tap, coin drops, citizen NPCs, pooling, juice. *Hardest + most important seat.*
- **Systems** — corruptor/progression/weapon/boss/economy state (Zustand store), `corruptors.ts` data pipeline.
- **UI/UX + content** — screens, counters, upgrade menu, case cards, art sourcing/rigging, **writing the corruption cases + punishments**.
- **Integration / polish / pitch** — glue, deploy, sound, responsive testing on real devices, and **owns the demo script + slide/QR**.

Pair up as needed (esp. game-feel + systems early). One person must own the pitch from day 1 — the demo is a deliverable, not an afterthought.

---

## 19. Future Features (parked — NOT for hackathon)

Ally system · passive DPS · collectible skins · daily missions · more punishments · seasonal corruption events · leaderboards (needs backend).

---

## Decisions needed before/at kickoff
1. **Currency model** — adopt dual (Recovered Money hero + Justice Points spendable)? *(§11, recommended yes)*
2. **Rendering** — PixiJS vs pure DOM/CSS for the game layer? *(§14, decide in the hour-3 prototype)*
3. **Art pipeline** — flat-vector + shared corruptor rig; asset source (packs / in-house / AI)? *(§13)*
4. **Case count** for MVP — target 5–8 fictional cases across 1–2 locations? *(§15)*
