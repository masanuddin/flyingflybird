export type Corruptor = {
  id: string
  /** Fictional archetype only — never a real person's name or likeness. */
  name: string
  occupation: string
  /** 1–2 line satirical scheme description, Bahasa Indonesia. */
  caseDescription: string
  /** Total recovered when fully collected must equal this exactly. */
  amountStolen: number
  maxHp: number
  /** Justice Points granted on subdual (earning wires up in M5). */
  jpReward: number
}

export type GameLocation = {
  id: string
  /** Player-facing name, Bahasa Indonesia. */
  name: string
  /** Normal corruptors, fought in order (progression is strictly linear). */
  corruptors: Corruptor[]
  /** Boss battle (timed) — state machine lands in M6. */
  boss: Corruptor
}

export type Punishment = {
  id: string
  name: string
  /** Educational one-liner: the real consequence of corruption. */
  description: string
  /** JP unlock cost. Cosmetic + educational only in MVP — no bonuses. */
  cost: number
  /** Greybox icon — pure asset swap at M8. */
  emoji: string
}

export type Weapon = {
  id: string
  name: string
  damageMultiplier: number
  /** JP cost to unlock. 0 = starter. Tiers must be purchased in order. */
  cost: number
  /** Greybox icon — pure asset swap at M8. */
  emoji: string
}
