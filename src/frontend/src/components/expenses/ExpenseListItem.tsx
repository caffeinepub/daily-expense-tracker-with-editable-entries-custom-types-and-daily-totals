import { useState } from 'react';
import { Expense } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { useUpdateExpense } from '../../features/expenses/useUpdateExpense';
import { useDeleteExpense } from '../../features/expenses/useDeleteExpense';
import { toast } from 'sonner';

interface ExpenseListItemProps {
  expense: Expense;
  selectedDayTime: bigint;
}

export default function ExpenseListItem({ expense, selectedDayTime }: ExpenseListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(expense.submitterName);
  const [editType, setEditType] = useState(expense.expenseType);
  const [editAmount, setEditAmount] = useState((Number(expense.amount) / 100).toFixed(2));

  const updateMutation = useUpdateExpense(selectedDayTime);
  const deleteMutation = useDeleteExpense(selectedDayTime);

  const handleSave = () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (!editType.trim()) {
      toast.error('Expense type cannot be empty');
      return;
    }

    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    updateMutation.mutate(
      {
        id: expense.id,
        input: {
          submitterName: editName.trim(),
          expenseType: editType.trim(),
          amount: BigInt(Math.round(parsedAmount * 100)),
          date: expense.date,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success('Expense updated successfully');
        },
        onError: (error) => {
          toast.error(`Failed to update expense: ${error.message}`);
        },
      }
    );
  };

  const handleCancel = () => {
    setEditName(expense.submitterName);
    setEditType(expense.expenseType);
    setEditAmount((Number(expense.amount) / 100).toFixed(2));
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(expense.id, {
        onSuccess: () => {
          toast.success('Expense deleted successfully');
        },
        onError: (error) => {
          toast.error(`Failed to delete expense: ${error.message}`);
        },
      });
    }
  };

  const isLoading = updateMutation.isPending || deleteMutation.isPending;

  if (isEditing) {
    return (
      <Card className="p-4 border-2 shadow-ledger">
        <div className="space-y-3">
          <div className="space-y-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Name"
              disabled={isLoading}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                placeholder="Expense type"
                disabled={isLoading}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Amount"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              size="sm"
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-2 hover:border-accent transition-colors shadow-ledger">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-lg truncate">{expense.expenseType}</p>
          <p className="text-sm text-muted-foreground">
            {expense.submitterName} • Added {new Date(Number(expense.createdAt) / 1000000).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold whitespace-nowrap">
            ${(Number(expense.amount) / 100).toFixed(2)}
          </span>
          <div className="flex gap-1">
            <Button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              variant="ghost"
              size="icon"
              className="h-9 w-9"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
