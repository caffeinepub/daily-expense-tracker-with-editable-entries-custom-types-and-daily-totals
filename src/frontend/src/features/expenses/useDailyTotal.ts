import { useQuery } from '@tanstack/react-query';
import { useAnonymousActor } from '../../hooks/useAnonymousActor';
import { expenseQueryKeys } from './queryKeys';

export function useDailyTotal(dayTime: bigint) {
  const { actor, isFetching: actorFetching } = useAnonymousActor();

  const query = useQuery<bigint>({
    queryKey: expenseQueryKeys.dailyTotal(dayTime),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDailyTotal(dayTime);
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
