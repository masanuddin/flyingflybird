import { create } from 'zustand'
import { LOCATIONS } from '../data/locations'
import { STARTER_WEAPON } from '../data/weapons'
import { BASE_TAP_DAMAGE, SUBDUED_DURATION_MS } from '../data/tuning'

export type BattlePhase = 'fighting' | 'subdued'

let advanceTimer: ReturnType<typeof setTimeout> | null = null

type GameState = {
  /** Progression is strictly linear; advancing locations lands in M5. */
  locationIndex: number
  corruptorIndex: number
  hp: number
  phase: BattlePhase
  /**
   * Hero score. INVARIANT: `collectCoin` is the ONLY code path that may
   * ever increase this — never a tap, never a subdue.
   */
  uangRakyat: number
  justicePoints: number
  /**
   * Money knocked loose by damage but not yet collected by a citizen.
   * Damage releases value proportional to HP dealt, so the running total
   * per corruptor equals `amountStolen` exactly once the floor is clear.
   */
  outstandingValue: number
  /** Returns damage actually dealt (0 when the tap is ignored). */
  tap: () => number
  /** Called by the sim when a citizen grabs a coin. `activeTokens` counts
   *  live coins including the grabbed one; the last token flushes the
   *  remainder so the books always balance. */
  collectCoin: (activeTokens: number) => void
  /** Called by the sim once the floor is clear while subdued. */
  scheduleAdvance: () => void
}

export const useGameStore = create<GameState>()((set, get) => ({
  locationIndex: 0,
  corruptorIndex: 0,
  hp: LOCATIONS[0].corruptors[0].maxHp,
  phase: 'fighting',
  uangRakyat: 0,
  justicePoints: 0,
  outstandingValue: 0,

  tap: () => {
    const { phase, hp, locationIndex, corruptorIndex, outstandingValue } = get()
    if (phase !== 'fighting') return 0

    const corruptor = LOCATIONS[locationIndex].corruptors[corruptorIndex]
    const damage = BASE_TAP_DAMAGE * STARTER_WEAPON.damageMultiplier
    const dealt = Math.min(hp, damage)
    const released = (dealt / corruptor.maxHp) * corruptor.amountStolen
    const nextHp = hp - dealt

    set({
      hp: nextHp,
      outstandingValue: outstandingValue + released,
      phase: nextHp === 0 ? 'subdued' : phase,
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
      // M4: cycle within the current location's roster. M5 replaces this
      // with linear progression (next corruptor → boss gate → next location).
      const roster = LOCATIONS[state.locationIndex].corruptors
      const nextIndex = (state.corruptorIndex + 1) % roster.length
      set({
        corruptorIndex: nextIndex,
        hp: roster[nextIndex].maxHp,
        phase: 'fighting',
        outstandingValue: 0,
      })
    }, SUBDUED_DURATION_MS)
  },
}))

export const selectLocation = (s: GameState) => LOCATIONS[s.locationIndex]
export const selectCorruptor = (s: GameState) =>
  LOCATIONS[s.locationIndex].corruptors[s.corruptorIndex]
