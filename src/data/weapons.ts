import type { Weapon } from '../types/content'

/**
 * Locked weapon tier ladder (CLAUDE.md). Purchasable in order only;
 * the highest owned tier is always the active weapon. Per-weapon
 * leveling costs live in tuning.ts. Emoji are greybox icons (M8 swap).
 */
export const WEAPONS: Weapon[] = [
  { id: 'tangan-kosong', name: 'Tangan Kosong', damageMultiplier: 1, cost: 0, emoji: '👊' },
  { id: 'sandal-emak', name: 'Sandal Emak', damageMultiplier: 1.5, cost: 50, emoji: '🩴' },
  { id: 'palu-keadilan', name: 'Palu Keadilan', damageMultiplier: 2, cost: 150, emoji: '🔨' },
  { id: 'laporan-audit', name: 'Laporan Audit', damageMultiplier: 3, cost: 400, emoji: '📋' },
  { id: 'satgas-antikorupsi', name: 'Satgas Antikorupsi', damageMultiplier: 5, cost: 1000, emoji: '🚨' },
]
