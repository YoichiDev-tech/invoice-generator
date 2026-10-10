export function formatCurrency(amount: number, currency = "EUR") {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}
