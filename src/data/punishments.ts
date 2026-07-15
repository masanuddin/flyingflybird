import type { Punishment } from '../types/content'

/**
 * Punishments are cosmetic + educational ONLY in MVP — no passive
 * bonuses. Unlocked with JP; purchase flow wires up in M5/M7.
 *
 * ⚠️ Costs are PROPOSED defaults (CLAUDE.md: "costs TBD — propose at
 * data phase and confirm"). Rationale: cheaper than the weapon ladder
 * (50/150/400/1000 JP) so unlocking one is a fun side-purchase, never
 * a trap that blocks weapon progression. Confirm or adjust freely.
 */
export const PUNISHMENTS: Punishment[] = [
  {
    id: 'penjara',
    name: 'Penjara',
    description: 'Koruptor bisa dihukum hingga 20 tahun penjara.',
    cost: 75,
    emoji: '🔒',
  },
  {
    id: 'sita-aset',
    name: 'Sita Aset',
    description: 'Negara berhak menyita aset hasil korupsi.',
    cost: 150,
    emoji: '📦',
  },
  {
    id: 'kerja-sosial',
    name: 'Kerja Sosial',
    description: 'Membersihkan fasilitas umum yang dulu ia telantarkan.',
    cost: 300,
    emoji: '🧹',
  },
  {
    id: 'larangan-jabatan',
    name: 'Larangan Jabatan Seumur Hidup',
    description: 'Hak politik dicabut — tak boleh menjabat lagi, selamanya.',
    cost: 600,
    emoji: '🚫',
  },
]
