import { useQuery } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';

const ANONYMOUS_ACTOR_QUERY_KEY = 'anonymousActor';

export function useAnonymousActor() {
  const actorQuery = useQuery<backendInterface>({
    queryKey: [ANONYMOUS_ACTOR_QUERY_KEY],
    queryFn: async () => {
      return await createActorWithConfig();
    },
    staleTime: Infinity,
    enabled: true,
  });

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
