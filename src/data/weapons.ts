import type { Weapon } from '../types/content'

/**
 * Locked weapon tier ladder (CLAUDE.md). Purchasable in order only.
 * Per-weapon leveling (+base damage, geometric JP cost) wires up in M5.
 */
export const WEAPONS: Weapon[] = [
  { id: 'tangan-kosong', name: 'Tangan Kosong', damageMultiplier: 1, cost: 0 },
  { id: 'sandal-emak', name: 'Sandal Emak', damageMultiplier: 1.5, cost: 50 },
  { id: 'palu-keadilan', name: 'Palu Keadilan', damageMultiplier: 2, cost: 150 },
  { id: 'laporan-audit', name: 'Laporan Audit', damageMultiplier: 3, cost: 400 },
  { id: 'satgas-antikorupsi', name: 'Satgas Antikorupsi', damageMultiplier: 5, cost: 1000 },
]

export const STARTER_WEAPON = WEAPONS[0]
