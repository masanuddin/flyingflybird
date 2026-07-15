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

export function faceForHp(hpFraction: number, subdued: boolean): string {
  if (subdued) return FACE_SUBDUED
  const stage = FACE_STAGES.find((s) => hpFraction >= s.minHpFraction)
  return (stage ?? FACE_STAGES[FACE_STAGES.length - 1]).face
}
