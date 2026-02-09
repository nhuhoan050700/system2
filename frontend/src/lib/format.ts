/** Format amount as VND (no decimals, thousands separator) */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(amount) + ' ₫'
}
