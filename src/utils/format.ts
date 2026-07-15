const idNumber = new Intl.NumberFormat('id-ID')

export function formatRupiah(amount: number): string {
  return `Rp${idNumber.format(Math.round(amount))}`
}

export function formatNumber(amount: number): string {
  return idNumber.format(Math.round(amount))
}
