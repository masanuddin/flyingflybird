const idNumber = new Intl.NumberFormat('id-ID')

export function formatRupiah(amount: number): string {
  return `Rp${idNumber.format(Math.round(amount))}`
}

export function formatNumber(amount: number): string {
  return idNumber.format(Math.round(amount))
}

/**
 * Compact rupiah for tight slots (header counter): full digits below
 * Rp1 miliar, then "Rp1,25 M" / "Rp300 T". Kerugian on the case stays
 * full-digit — the absurd length IS the joke.
 */
export function formatRupiahCompact(amount: number): string {
  const n = Math.round(amount)
  const abs = Math.abs(n)
  if (abs < 1_000_000_000) return `Rp${idNumber.format(n)}`
  const [div, suffix] = abs >= 1_000_000_000_000 ? [1_000_000_000_000, 'T'] : [1_000_000_000, 'M']
  const v = n / div
  const digits = Math.abs(v) < 10 ? 2 : Math.abs(v) < 100 ? 1 : 0
  return `Rp${v.toLocaleString('id-ID', { maximumFractionDigits: digits })} ${suffix}`
}
