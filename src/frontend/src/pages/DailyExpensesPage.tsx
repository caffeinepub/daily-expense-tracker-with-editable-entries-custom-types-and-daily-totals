import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import ExpenseListItem from '../components/expenses/ExpenseListItem';
import { useExpensesForDay } from '../features/expenses/useExpensesForDay';
import { useCreateExpense } from '../features/expenses/useCreateExpense';
import { useDailyTotal } from '../features/expenses/useDailyTotal';
import { useMonthlyTotalToNow } from '../features/expenses/useMonthlyTotalToNow';
import { useYearlyTotalToNow } from '../features/expenses/useYearlyTotalToNow';
import { useAllYearsTotalToNow } from '../features/expenses/useAllYearsTotalToNow';
import { dateToStartOfDayTime } from '../features/expenses/date';
import { toast } from 'sonner';

export default function DailyExpensesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [submitterName, setSubmitterName] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [amount, setAmount] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const selectedDayTime = dateToStartOfDayTime(selectedDate);
  const { data: expenses = [], isLoading: expensesLoading } = useExpensesForDay(selectedDayTime);
  const { data: dailyTotal, isLoading: totalLoading } = useDailyTotal(selectedDayTime);
  const { data: monthlyTotal, isLoading: monthlyLoading } = useMonthlyTotalToNow();
  const { data: yearlyTotal, isLoading: yearlyLoading } = useYearlyTotalToNow();
  const { data: allYearsTotal, isLoading: allYearsLoading } = useAllYearsTotalToNow();
  const createExpenseMutation = useCreateExpense(selectedDayTime);

  const handleAddExpense = () => {
    if (!submitterName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!expenseType.trim()) {
      toast.error('Please enter an expense type');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    createExpenseMutation.mutate(
      {
        submitterName: submitterName.trim(),
        expenseType: expenseType.trim(),
        amount: BigInt(Math.round(parsedAmount * 100)),
        date: selectedDayTime,
      },
      {
        onSuccess: () => {
          setSubmitterName('');
          setExpenseType('');
          setAmount('');
          toast.success('Expense added successfully');
        },
        onError: (error) => {
          toast.error(`Failed to add expense: ${error.message}`);
        },
      }
    );
  };

  const hasExpenses = expenses.length > 0;
  const displayTotal = dailyTotal ?? BigInt(0);
  const displayMonthlyTotal = monthlyTotal ?? BigInt(0);
  const displayYearlyTotal = yearlyTotal ?? BigInt(0);
  const displayAllYearsTotal = allYearsTotal ?? BigInt(0);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Date Selector */}
        <Card className="border-2 shadow-ledger">
          <CardHeader>
            <CardTitle className="text-xl">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-12"
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* Add Expense Form */}
        <Card className="border-2 shadow-ledger">
          <CardHeader>
            <CardTitle className="text-xl">Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="submitter-name">Your Name</Label>
                <Input
                  id="submitter-name"
                  placeholder="e.g., John Doe"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  disabled={createExpenseMutation.isPending}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-type">Expense Type</Label>
                  <Input
                    id="expense-type"
                    placeholder="e.g., Groceries, Coffee, Transport"
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value)}
                    disabled={createExpenseMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={createExpenseMutation.isPending}
                  />
                </div>
              </div>
              <Button
                onClick={handleAddExpense}
                disabled={createExpenseMutation.isPending}
                className="w-full h-12"
              >
                {createExpenseMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Add Expense
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Totals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Daily Total */}
          <Card className="border-2 bg-accent/30 shadow-ledger">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Daily Total:</span>
                <span className="text-2xl font-bold">
                  {totalLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `$${(Number(displayTotal) / 100).toFixed(2)}`
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Month-to-date Total */}
          <Card className="border-2 bg-accent/30 shadow-ledger">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Month-to-date Total:</span>
                <span className="text-2xl font-bold">
                  {monthlyLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `$${(Number(displayMonthlyTotal) / 100).toFixed(2)}`
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Year-to-date Total */}
          <Card className="border-2 bg-accent/30 shadow-ledger">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Year-to-date Total:</span>
                <span className="text-2xl font-bold">
                  {yearlyLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `$${(Number(displayYearlyTotal) / 100).toFixed(2)}`
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Multi-year Total (to date) */}
          <Card className="border-2 bg-accent/30 shadow-ledger">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Multi-year Total (to date):</span>
                <span className="text-2xl font-bold">
                  {allYearsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `$${(Number(displayAllYearsTotal) / 100).toFixed(2)}`
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses List */}
        <Card className="border-2 shadow-ledger">
          <CardHeader>
            <CardTitle className="text-xl">
              Expenses for {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : hasExpenses ? (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <ExpenseListItem
                    key={expense.id.toString()}
                    expense={expense}
                    selectedDayTime={selectedDayTime}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <img
                  src="/assets/generated/expense-ledger-illustration.dim_1200x600.png"
                  alt="No expenses"
                  className="w-full max-w-md mb-6 opacity-40"
                />
                <p className="text-muted-foreground text-lg">
                  No expenses recorded for this day yet.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Add your first expense using the form above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
