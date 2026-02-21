import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import ExpenseDetailsTable from './ExpenseDetailsTable';
import { useExpensesInRange } from '../../features/expenses/useExpensesInRange';
import type { Expense } from '../../backend';

interface ExpandableDetailsSectionProps {
  label: string;
  startDate?: bigint;
  endDate?: bigint;
  expenses?: Expense[];
}

export default function ExpandableDetailsSection({
  label,
  startDate,
  endDate,
  expenses: providedExpenses,
}: ExpandableDetailsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use date range query if dates are provided, otherwise use provided expenses
  const shouldFetchRange = startDate !== undefined && endDate !== undefined && !providedExpenses;
  const { data: rangeExpenses, isLoading } = useExpensesInRange(
    startDate ?? BigInt(0),
    endDate ?? BigInt(0)
  );

  const expensesToDisplay = providedExpenses ?? rangeExpenses ?? [];

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={handleToggle}
        className="w-full justify-between"
        disabled={shouldFetchRange && isLoading}
      >
        <span>{label}</span>
        {shouldFetchRange && isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          {shouldFetchRange && isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ExpenseDetailsTable expenses={expensesToDisplay} />
          )}
        </div>
      )}
    </div>
  );
}
