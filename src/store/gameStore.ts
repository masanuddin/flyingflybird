import { create } from 'zustand'
import { GREYBOX_CORRUPTORS } from '../data/corruptors'
import { STARTER_WEAPON } from '../data/weapons'
import { BASE_TAP_DAMAGE, SUBDUED_DURATION_MS } from '../data/tuning'

export type BattlePhase = 'fighting' | 'subdued'

type GameState = {
  corruptorIndex: number
  hp: number
  phase: BattlePhase
  /**
   * Hero score. INVARIANT: only a citizen collecting a coin may ever
   * increase this (lands in M2) — never a tap, never a subdue.
   */
  uangRakyat: number
  justicePoints: number
  tap: () => void
}

export const useGameStore = create<GameState>()((set, get) => ({
  corruptorIndex: 0,
  hp: GREYBOX_CORRUPTORS[0].maxHp,
  phase: 'fighting',
  uangRakyat: 0,
  justicePoints: 0,

  tap: () => {
    const { phase, hp } = get()
    if (phase !== 'fighting') return

    const damage = BASE_TAP_DAMAGE * STARTER_WEAPON.damageMultiplier
    const nextHp = Math.max(0, hp - damage)
    if (nextHp > 0) {
      set({ hp: nextHp })
      return
    }

    set({ hp: 0, phase: 'subdued' })
    setTimeout(() => {
      const state = get()
      if (state.phase !== 'subdued') return
      const nextIndex = (state.corruptorIndex + 1) % GREYBOX_CORRUPTORS.length
      set({
        corruptorIndex: nextIndex,
        hp: GREYBOX_CORRUPTORS[nextIndex].maxHp,
        phase: 'fighting',
      })
    }, SUBDUED_DURATION_MS)
  },
}))

export const selectCorruptor = (s: GameState) => GREYBOX_CORRUPTORS[s.corruptorIndex]
