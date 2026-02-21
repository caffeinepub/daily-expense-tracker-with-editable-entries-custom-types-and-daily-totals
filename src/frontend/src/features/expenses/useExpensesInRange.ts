import { useQuery } from '@tanstack/react-query';
import { useAnonymousActor } from '../../hooks/useAnonymousActor';
import { expenseQueryKeys } from './queryKeys';
import type { Expense } from '../../backend';

export function useExpensesInRange(startDate: bigint, endDate: bigint) {
  const { actor, isFetching: actorFetching } = useAnonymousActor();

  return useQuery<Expense[]>({
    queryKey: expenseQueryKeys.expensesInRange(startDate, endDate),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpensesInRange(startDate, endDate);
    },
    enabled: !!actor && !actorFetching,
  });
}
