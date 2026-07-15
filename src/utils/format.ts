const idNumber = new Intl.NumberFormat('id-ID')

export function formatRupiah(amount: number): string {
  return `Rp${idNumber.format(amount)}`
}

export function formatNumber(amount: number): string {
  return idNumber.format(amount)
}
