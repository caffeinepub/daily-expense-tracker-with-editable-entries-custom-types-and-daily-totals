// Centralized React Query key helpers for expense-related queries
// Ensures consistent caching and invalidation across hooks and mutations

export const expenseQueryKeys = {
  expensesForDay: (dayTime: bigint) => ['expenses', dayTime.toString()],
  dailyTotal: (dayTime: bigint) => ['dailyTotal', dayTime.toString()],
  monthlyTotalToNow: () => ['monthlyTotalToNow'],
  yearlyTotalToNow: () => ['yearlyTotalToNow'],
  allYearsTotalToNow: () => ['allYearsTotalToNow'],
  expensesInRange: (startDate: bigint, endDate: bigint) => ['expensesInRange', startDate.toString(), endDate.toString()],
  allExpenses: () => ['allExpenses'],
};
