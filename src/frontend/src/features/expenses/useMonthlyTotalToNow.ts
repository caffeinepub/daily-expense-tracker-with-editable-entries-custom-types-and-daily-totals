import { useQuery } from '@tanstack/react-query';
import { useAnonymousActor } from '../../hooks/useAnonymousActor';
import { expenseQueryKeys } from './queryKeys';

export function useMonthlyTotalToNow() {
  const { actor, isFetching: actorFetching } = useAnonymousActor();

  const query = useQuery<bigint>({
    queryKey: expenseQueryKeys.monthlyTotalToNow(),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMonthlyTotalToNow();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    data: query.data,
  };
}
