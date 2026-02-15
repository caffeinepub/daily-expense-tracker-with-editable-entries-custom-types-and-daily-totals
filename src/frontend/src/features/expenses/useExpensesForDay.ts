import { useQuery } from '@tanstack/react-query';
import { useAnonymousActor } from '../../hooks/useAnonymousActor';
import { Expense } from '../../backend';
import { isSameDay } from './date';

export function useExpensesForDay(dayTime: bigint) {
  const { actor, isFetching: actorFetching } = useAnonymousActor();

  return useQuery<Expense[]>({
    queryKey: ['expenses', dayTime.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const allExpenses = await actor.getAllExpenses();
      return allExpenses.filter((expense) => isSameDay(expense.date, dayTime));
    },
    enabled: !!actor && !actorFetching,
  });
}
