import { useQuery } from '@tanstack/react-query';
import { useAnonymousActor } from '../../hooks/useAnonymousActor';
import { expenseQueryKeys } from './queryKeys';

export function useYearlyTotalToNow() {
  const { actor, isFetching: actorFetching } = useAnonymousActor();

  const query = useQuery<bigint>({
    queryKey: expenseQueryKeys.yearlyTotalToNow(),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getYearlyTotalToNow();
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
