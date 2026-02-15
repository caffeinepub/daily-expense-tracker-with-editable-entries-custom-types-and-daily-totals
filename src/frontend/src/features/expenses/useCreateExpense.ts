import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAnonymousActor } from '../../hooks/useAnonymousActor';
import { ExpenseInput } from '../../backend';
import { expenseQueryKeys } from './queryKeys';

export function useCreateExpense(selectedDayTime: bigint) {
  const { actor } = useAnonymousActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ExpenseInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createExpense(input);
    },
    onSuccess: () => {
      // Invalidate and refetch queries for the selected day
      queryClient.invalidateQueries({ 
        queryKey: expenseQueryKeys.expensesForDay(selectedDayTime),
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: expenseQueryKeys.dailyTotal(selectedDayTime),
        refetchType: 'active'
      });
      // Invalidate and refetch MTD, YTD, and all-years totals
      queryClient.invalidateQueries({ 
        queryKey: expenseQueryKeys.monthlyTotalToNow(),
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: expenseQueryKeys.yearlyTotalToNow(),
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: expenseQueryKeys.allYearsTotalToNow(),
        refetchType: 'active'
      });
    },
  });
}
