export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(days: number) {
  if (days >= 365)
    return `${Math.round(days / 365)} year${days >= 730 ? "s" : ""}`;
  if (days >= 30)
    return `${Math.round(days / 30)} month${days >= 60 ? "s" : ""}`;
  return `${days} day${days !== 1 ? "s" : ""}`;
}

export function formatJobLimit(limit: number) {
  return limit === -1 ? "Unlimited" : `${limit} job${limit !== 1 ? "s" : ""}`;
}
