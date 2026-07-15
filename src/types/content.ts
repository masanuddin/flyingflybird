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
}

export type Weapon = {
  id: string
  name: string
  damageMultiplier: number
  /** JP cost to unlock. 0 = starter. Tiers must be purchased in order. */
  cost: number
}
