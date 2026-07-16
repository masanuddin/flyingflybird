import { LOCATIONS } from '../data/locations'
import { WEAPONS } from '../data/weapons'
import { PUNISHMENTS } from '../data/punishments'

/**
 * THE save util (architecture invariant #9): one versioned localStorage
 * blob, safe parse — anything corrupt, missing, or from another version
 * starts a new game. Runtime entities (hp, phase, coins, timers) are
 * NEVER persisted; loading always lands on a clean full-HP fight.
 */

const SAVE_KEY = 'wtc-save'
const SAVE_VERSION = 1

export type SaveData = {
  version: number
  uangRakyat: number
  justicePoints: number
  activeWeaponIndex: number
  weaponLevels: Record<string, number>
  unlockedPunishments: string[]
  locationIndex: number
  corruptorIndex: number
  /** 'active' is never persisted — a saved boss fight resumes as bossReady. */
  bossState: 'locked' | 'available' | 'gate'
  gateRemaining: number
  bossReleasedValue: number
  muted: boolean
}

function isFiniteNonNegative(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const d = JSON.parse(raw) as Partial<SaveData>
    if (d.version !== SAVE_VERSION) return null
    if (
      !isFiniteNonNegative(d.uangRakyat) ||
      !isFiniteNonNegative(d.justicePoints) ||
      !isFiniteNonNegative(d.bossReleasedValue) ||
      typeof d.muted !== 'boolean' ||
      typeof d.weaponLevels !== 'object' ||
      d.weaponLevels === null ||
      !Object.values(d.weaponLevels).every(isFiniteNonNegative) ||
      !Array.isArray(d.unlockedPunishments) ||
      !d.unlockedPunishments.every((p) => typeof p === 'string')
    ) {
      return null
    }
    if (
      !Number.isInteger(d.activeWeaponIndex) ||
      d.activeWeaponIndex! < 0 ||
      d.activeWeaponIndex! >= WEAPONS.length ||
      !Number.isInteger(d.locationIndex) ||
      d.locationIndex! < 0 ||
      d.locationIndex! >= LOCATIONS.length
    ) {
      return null
    }
    const roster = LOCATIONS[d.locationIndex!].corruptors
    if (
      !Number.isInteger(d.corruptorIndex) ||
      d.corruptorIndex! < 0 ||
      d.corruptorIndex! >= roster.length
    ) {
      return null
    }
    if (d.bossState !== 'locked' && d.bossState !== 'available' && d.bossState !== 'gate') {
      return null
    }
    if (!isFiniteNonNegative(d.gateRemaining)) return null

    return {
      version: SAVE_VERSION,
      uangRakyat: d.uangRakyat,
      justicePoints: d.justicePoints,
      activeWeaponIndex: d.activeWeaponIndex!,
      weaponLevels: d.weaponLevels as Record<string, number>,
      unlockedPunishments: d.unlockedPunishments.filter((id) =>
        PUNISHMENTS.some((p) => p.id === id),
      ),
      locationIndex: d.locationIndex!,
      corruptorIndex: d.corruptorIndex!,
      // A finished gate resumes as an available boss.
      bossState: d.bossState === 'gate' && d.gateRemaining === 0 ? 'available' : d.bossState,
      gateRemaining: d.gateRemaining,
      bossReleasedValue: d.bossReleasedValue,
      muted: d.muted,
    }
  } catch {
    return null
  }
}

export function writeSave(data: Omit<SaveData, 'version'>): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, ...data }))
  } catch {
    // Quota / private mode — the game simply plays without persistence.
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    // ignore
  }
}
