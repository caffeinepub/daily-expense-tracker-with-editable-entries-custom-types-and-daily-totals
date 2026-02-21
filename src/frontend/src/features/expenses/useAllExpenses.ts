import { useQuery } from '@tanstack/react-query';
import { useAnonymousActor } from '../../hooks/useAnonymousActor';
import { expenseQueryKeys } from './queryKeys';
import type { Expense } from '../../backend';

export function useAllExpenses() {
  const { actor, isFetching: actorFetching } = useAnonymousActor();

  return useQuery<Expense[]>({
    queryKey: expenseQueryKeys.allExpenses(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExpenses();
    },
    enabled: !!actor && !actorFetching,
  });
}
