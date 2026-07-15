/** Central tuning constants. All gameplay numbers live here, never inline in components. */

/** Base damage per tap before weapon multiplier. */
export const BASE_TAP_DAMAGE = 10

/** How long the DIBEKUK state holds before the next corruptor slides in. */
export const SUBDUED_DURATION_MS = 1200

/**
 * Greybox face states swapped by remaining-HP fraction, checked top-down.
 * Final art at M8 swaps these slots without layout rework.
 */
export const FACE_STAGES = [
  { minHpFraction: 0.7, face: '😐' },
  { minHpFraction: 0.35, face: '😟' },
  { minHpFraction: 0, face: '😰' },
] as const

export const FACE_SUBDUED = '😵'

/* ---- Signature mechanic (M2): coins → citizens → counter ---- */

/** Hard cap on pooled on-screen coins. Overflow value banks numerically. */
export const MAX_COINS = 12
/** Pooled citizen collectors (design range 4–6). */
export const MAX_CITIZENS = 5
export const COINS_PER_TAP = 1

/** Coin ballistics, px-based (play area is ~390×600 on a phone). */
export const COIN_GRAVITY = 2200
export const COIN_POP_VY_MIN = -620
export const COIN_POP_VY_MAX = -380
/** Keep coin landings inside the floor band with this inset. */
export const FLOOR_PADDING_X = 16

export const CITIZEN_SPEED = 140
export const COLLECT_RADIUS = 14

/** Greybox citizen sprites — pure asset swap at M8. Length == MAX_CITIZENS. */
export const CITIZEN_EMOJIS = ['🧕', '👨‍🌾', '👩‍🏫', '🧑‍💼', '👵'] as const

/* ---- Juice (M3) ---- */

/** Pooled floating damage numbers; oldest slot is recycled on overflow. */
export const MAX_DAMAGE_NUMBERS = 8
export const DMG_FLOAT_MS = 650
export const DMG_FLOAT_DISTANCE = 64

/** Screen shake scales with damage dealt. */
export const SHAKE_DURATION_MS = 180
export const SHAKE_AMP_BASE = 2
export const SHAKE_AMP_PER_DAMAGE = 0.2
export const SHAKE_AMP_MAX = 12
export const SHAKE_AMP_SUBDUE = 10
export const SHAKE_SUBDUE_MS = 400

export const COUNTER_ROLL_S = 0.35

/* ---- Economy (M5) ---- */

/** Per-weapon leveling: each level adds flat base damage… */
export const UPGRADE_DMG_PER_LEVEL = 2
/** …at a geometric JP cost. */
export const UPGRADE_COST_BASE = 10
export const UPGRADE_COST_GROWTH = 1.5

export function upgradeCost(level: number): number {
  return Math.round(UPGRADE_COST_BASE * UPGRADE_COST_GROWTH ** level)
}

/* ---- Boss (M6) ---- */

/** Countdown for every boss fight. Fail → the boss escapes. */
export const BOSS_TIMER_S = 20
/** Normal corruptors to subdue before an escaped boss returns (full HP). */
export const BOSS_RETRY_GATE = 10

export function faceForHp(hpFraction: number, subdued: boolean): string {
  if (subdued) return FACE_SUBDUED
  const stage = FACE_STAGES.find((s) => hpFraction >= s.minHpFraction)
  return (stage ?? FACE_STAGES[FACE_STAGES.length - 1]).face
}
