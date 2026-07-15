import { create } from 'zustand'
import { LOCATIONS } from '../data/locations'
import { WEAPONS } from '../data/weapons'
import {
  BASE_TAP_DAMAGE,
  SUBDUED_DURATION_MS,
  UPGRADE_DMG_PER_LEVEL,
  upgradeCost,
} from '../data/tuning'

export type BattlePhase = 'fighting' | 'subdued'

let advanceTimer: ReturnType<typeof setTimeout> | null = null

type GameState = {
  /** Progression is strictly linear — no revisiting previous locations. */
  locationIndex: number
  corruptorIndex: number
  hp: number
  phase: BattlePhase
  /**
   * Hero score. INVARIANT: `collectCoin` is the ONLY code path that may
   * ever increase this — never a tap, never a subdue.
   */
  uangRakyat: number
  /** Spendable currency: earned per subdual, spent on weapons/punishments. */
  justicePoints: number
  /** Highest owned tier == active weapon; tiers are bought in order. */
  activeWeaponIndex: number
  /** Per-weapon upgrade levels (+base damage each). */
  weaponLevels: Record<string, number>
  /** Money knocked loose by damage but not yet collected by a citizen. */
  outstandingValue: number
  /** Returns damage actually dealt (0 when the tap is ignored). */
  tap: () => number
  collectCoin: (activeTokens: number) => void
  scheduleAdvance: () => void
  /** Level up the active weapon. Returns true on success (for SFX). */
  upgradeWeapon: () => boolean
  /** Buy the next weapon tier in order. Returns true on success. */
  buyNextWeapon: () => boolean
}

/** Damage per tap for the current weapon + level. */
export const selectDamage = (s: Pick<GameState, 'activeWeaponIndex' | 'weaponLevels'>) => {
  const weapon = WEAPONS[s.activeWeaponIndex]
  const level = s.weaponLevels[weapon.id] ?? 0
  return Math.round((BASE_TAP_DAMAGE + level * UPGRADE_DMG_PER_LEVEL) * weapon.damageMultiplier)
}

export const useGameStore = create<GameState>()((set, get) => ({
  locationIndex: 0,
  corruptorIndex: 0,
  hp: LOCATIONS[0].corruptors[0].maxHp,
  phase: 'fighting',
  uangRakyat: 0,
  justicePoints: 0,
  activeWeaponIndex: 0,
  weaponLevels: {},
  outstandingValue: 0,

  tap: () => {
    const state = get()
    if (state.phase !== 'fighting') return 0

    const corruptor = LOCATIONS[state.locationIndex].corruptors[state.corruptorIndex]
    const dealt = Math.min(state.hp, selectDamage(state))
    const released = (dealt / corruptor.maxHp) * corruptor.amountStolen
    const nextHp = state.hp - dealt

    set({
      hp: nextHp,
      outstandingValue: state.outstandingValue + released,
      ...(nextHp === 0
        ? {
            phase: 'subdued' as const,
            // JP reward lands at the subdue moment. uangRakyat is NOT
            // touched here — citizens still have to collect the floor.
            justicePoints: state.justicePoints + corruptor.jpReward,
          }
        : null),
    })
    return dealt
  },

  collectCoin: (activeTokens) => {
    if (activeTokens <= 0) return
    const { uangRakyat, outstandingValue } = get()
    const share = activeTokens === 1 ? outstandingValue : outstandingValue / activeTokens
    set({
      uangRakyat: uangRakyat + share,
      outstandingValue: Math.max(0, outstandingValue - share),
    })
  },

  scheduleAdvance: () => {
    if (get().phase !== 'subdued' || advanceTimer !== null) return
    advanceTimer = setTimeout(() => {
      advanceTimer = null
      const state = get()
      if (state.phase !== 'subdued') return

      // Linear progression: next mook, else next location. The boss gate
      // slots in between at M6. After the final location the last roster
      // cycles — the loop is endless, there is no Game Over.
      const roster = LOCATIONS[state.locationIndex].corruptors
      let locationIndex = state.locationIndex
      let corruptorIndex = state.corruptorIndex + 1
      if (corruptorIndex >= roster.length) {
        corruptorIndex = 0
        if (locationIndex + 1 < LOCATIONS.length) locationIndex += 1
      }
      set({
        locationIndex,
        corruptorIndex,
        hp: LOCATIONS[locationIndex].corruptors[corruptorIndex].maxHp,
        phase: 'fighting',
        outstandingValue: 0,
      })
    }, SUBDUED_DURATION_MS)
  },

  upgradeWeapon: () => {
    const { justicePoints, activeWeaponIndex, weaponLevels } = get()
    const weapon = WEAPONS[activeWeaponIndex]
    const level = weaponLevels[weapon.id] ?? 0
    const cost = upgradeCost(level)
    if (justicePoints < cost) return false
    set({
      justicePoints: justicePoints - cost,
      weaponLevels: { ...weaponLevels, [weapon.id]: level + 1 },
    })
    return true
  },

  buyNextWeapon: () => {
    const { justicePoints, activeWeaponIndex } = get()
    const next = WEAPONS[activeWeaponIndex + 1]
    if (!next || justicePoints < next.cost) return false
    set({
      justicePoints: justicePoints - next.cost,
      activeWeaponIndex: activeWeaponIndex + 1,
    })
    return true
  },
}))

export const selectLocation = (s: GameState) => LOCATIONS[s.locationIndex]
export const selectCorruptor = (s: GameState) =>
  LOCATIONS[s.locationIndex].corruptors[s.corruptorIndex]
export const selectWeapon = (s: GameState) => WEAPONS[s.activeWeaponIndex]
export const selectWeaponLevel = (s: GameState) =>
  s.weaponLevels[WEAPONS[s.activeWeaponIndex].id] ?? 0
