import type { Corruptor } from '../types/content'

/**
 * GREYBOX PLACEHOLDER ROSTER (M1) — school-themed archetypes for the first
 * location (Sekolah). The real per-location rosters land in M4 (data pipeline).
 * Do not balance or write final copy against these entries.
 * All names are fictional archetypes — never real people.
 */
export const GREYBOX_CORRUPTORS: Corruptor[] = [
  {
    id: 'greybox-bendahara-komite',
    name: 'Pak Broto',
    occupation: 'Bendahara Komite Sekolah',
    caseDescription: 'Menyunat uang kas seragam murid',
    amountStolen: 100,
    maxHp: 100,
  },
  {
    id: 'greybox-panitia-studytour',
    name: 'Bu Rina',
    occupation: 'Panitia Study Tour',
    caseDescription: 'Menggelembungkan harga sewa bus study tour',
    amountStolen: 500,
    maxHp: 150,
  },
  {
    id: 'greybox-dana-bos',
    name: 'Pak Dedi',
    occupation: 'Pengelola Dana BOS',
    caseDescription: 'Renovasi perpustakaan fiktif dari dana BOS',
    amountStolen: 1000,
    maxHp: 200,
  },
]
