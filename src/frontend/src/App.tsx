import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import DailyExpensesPage from './pages/DailyExpensesPage';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppLayout>
        <DailyExpensesPage />
      </AppLayout>
      <Toaster />
    </ThemeProvider>
  );
}
