import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAnonymousActor } from '../../hooks/useAnonymousActor';
import { ExpenseId } from '../../backend';
import { expenseQueryKeys } from './queryKeys';

export function useDeleteExpense(selectedDayTime: bigint) {
  const { actor } = useAnonymousActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: ExpenseId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteExpense(id);
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
