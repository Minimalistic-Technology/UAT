export const TRANSACTION_CATEGORIES = [
  "Shopping",
  "Household",
  "Food",
  "Transport",
  "Bills",
  "Entertainment",
  "Health",
  "Other",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];
