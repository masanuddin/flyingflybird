import { create } from 'zustand'
import { LOCATIONS } from '../data/locations'
import { WEAPONS } from '../data/weapons'
import {
  BASE_TAP_DAMAGE,
  BOSS_RETRY_GATE,
  BOSS_TIMER_S,
  SUBDUED_DURATION_MS,
  UPGRADE_DMG_PER_LEVEL,
  upgradeCost,
} from '../data/tuning'

export type BattlePhase = 'fighting' | 'subdued' | 'bossReady' | 'bossFight'
/** Boss button state machine — the boss is never freely tappable. */
export type BossState = 'locked' | 'available' | 'active' | 'gate'

let advanceTimer: ReturnType<typeof setTimeout> | null = null

type GameState = {
  /** Progression is strictly linear — no revisiting previous locations. */
  locationIndex: number
  corruptorIndex: number
  hp: number
  phase: BattlePhase
  bossState: BossState
  /** Subduals left before an escaped boss returns. */
  gateRemaining: number
  /** Epoch ms when the active boss fight expires. */
  bossDeadline: number | null
  /**
   * Value already released by this location's boss across attempts.
   * A boss retry is the SAME case, so releases are capped cumulatively —
   * total recovered per boss equals amountStolen exactly, even after
   * escapes. (A respawning mook, by contrast, is a fresh case.)
   */
  bossReleasedValue: number
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
  startBossFight: () => void
  bossTimeout: () => void
  upgradeWeapon: () => boolean
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
  bossState: 'locked',
  gateRemaining: 0,
  bossDeadline: null,
  bossReleasedValue: 0,
  uangRakyat: 0,
  justicePoints: 0,
  activeWeaponIndex: 0,
  weaponLevels: {},
  outstandingValue: 0,

  tap: () => {
    const state = get()

    if (state.phase === 'fighting') {
      const corruptor = LOCATIONS[state.locationIndex].corruptors[state.corruptorIndex]
      const dealt = Math.min(state.hp, selectDamage(state))
      const released = (dealt / corruptor.maxHp) * corruptor.amountStolen
      const nextHp = state.hp - dealt
      const subdued = nextHp === 0
      const gateHit = subdued && state.bossState === 'gate'
      const gateRemaining = gateHit ? Math.max(0, state.gateRemaining - 1) : state.gateRemaining
      set({
        hp: nextHp,
        outstandingValue: state.outstandingValue + released,
        ...(subdued
          ? {
              phase: 'subdued' as const,
              justicePoints: state.justicePoints + corruptor.jpReward,
              gateRemaining,
              bossState: gateHit && gateRemaining === 0 ? ('available' as const) : state.bossState,
            }
          : null),
      })
      return dealt
    }

    if (state.phase === 'bossFight') {
      const boss = LOCATIONS[state.locationIndex].boss
      const dealt = Math.min(state.hp, selectDamage(state))
      // Cumulative cap: escapes must never let the books exceed amountStolen.
      const releasable = Math.max(0, boss.amountStolen - state.bossReleasedValue)
      const released = Math.min((dealt / boss.maxHp) * boss.amountStolen, releasable)
      const nextHp = state.hp - dealt
      set({
        hp: nextHp,
        outstandingValue: state.outstandingValue + released,
        bossReleasedValue: state.bossReleasedValue + released,
        ...(nextHp === 0
          ? {
              phase: 'subdued' as const,
              justicePoints: state.justicePoints + boss.jpReward,
              bossDeadline: null,
            }
          : null),
      })
      return dealt
    }

    return 0
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
      const location = LOCATIONS[state.locationIndex]

      // Boss win → location cleared → next location. The final location
      // restarts its own roster forever: the loop is endless, no Game Over.
      if (state.bossState === 'active') {
        const nextLocation =
          state.locationIndex + 1 < LOCATIONS.length ? state.locationIndex + 1 : state.locationIndex
        set({
          locationIndex: nextLocation,
          corruptorIndex: 0,
          hp: LOCATIONS[nextLocation].corruptors[0].maxHp,
          phase: 'fighting',
          bossState: 'locked',
          gateRemaining: 0,
          bossDeadline: null,
          bossReleasedValue: 0,
          outstandingValue: 0,
        })
        return
      }

      // Mook subdued: roster in order → boss gate. During the escape gate
      // the roster cycles (each respawn is a fresh case) until 10 are down.
      let next = state.corruptorIndex + 1
      let bossState = state.bossState
      if (next >= location.corruptors.length && bossState === 'locked') bossState = 'available'
      if (bossState === 'available') {
        set({ phase: 'bossReady', bossState, hp: location.boss.maxHp, outstandingValue: 0 })
        return
      }
      if (next >= location.corruptors.length) next = 0
      set({
        corruptorIndex: next,
        hp: location.corruptors[next].maxHp,
        phase: 'fighting',
        bossState,
        outstandingValue: 0,
      })
    }, SUBDUED_DURATION_MS)
  },

  startBossFight: () => {
    const state = get()
    if (state.phase !== 'bossReady' || state.bossState !== 'available') return
    set({
      phase: 'bossFight',
      bossState: 'active',
      hp: LOCATIONS[state.locationIndex].boss.maxHp,
      bossDeadline: Date.now() + BOSS_TIMER_S * 1000,
    })
  },

  bossTimeout: () => {
    const state = get()
    if (state.phase !== 'bossFight' || state.bossDeadline === null) return
    if (Date.now() < state.bossDeadline) return
    // The big fish gets away — already-released coins stay collectable.
    const roster = LOCATIONS[state.locationIndex].corruptors
    set({
      phase: 'fighting',
      bossState: 'gate',
      gateRemaining: BOSS_RETRY_GATE,
      bossDeadline: null,
      corruptorIndex: 0,
      hp: roster[0].maxHp,
    })
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
export const selectCorruptor = (s: GameState) => {
  const location = LOCATIONS[s.locationIndex]
  const bossOnStage =
    s.phase === 'bossReady' ||
    s.phase === 'bossFight' ||
    (s.phase === 'subdued' && s.bossState === 'active')
  return bossOnStage ? location.boss : location.corruptors[s.corruptorIndex]
}
export const selectWeapon = (s: GameState) => WEAPONS[s.activeWeaponIndex]
export const selectWeaponLevel = (s: GameState) =>
  s.weaponLevels[WEAPONS[s.activeWeaponIndex].id] ?? 0
