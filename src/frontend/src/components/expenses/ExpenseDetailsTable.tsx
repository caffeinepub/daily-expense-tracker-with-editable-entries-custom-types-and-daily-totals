import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import type { Expense } from '../../backend';
import { timeToDate } from '../../features/expenses/date';

interface ExpenseDetailsTableProps {
  expenses: Expense[];
}

export default function ExpenseDetailsTable({ expenses }: ExpenseDetailsTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No expenses found for this period.
      </div>
    );
  }

  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => {
    return Number(b.date - a.date);
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Submitter</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedExpenses.map((expense) => (
            <TableRow key={expense.id.toString()}>
              <TableCell className="font-medium">
                {format(timeToDate(expense.date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>{expense.expenseType}</TableCell>
              <TableCell>{expense.submitterName}</TableCell>
              <TableCell className="text-right font-semibold">
                ${(Number(expense.amount) / 100).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
