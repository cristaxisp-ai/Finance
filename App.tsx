
import React, { useState, useEffect } from 'react';
import { FinanceState, Transaction, TransactionType, Goal, Account, DailyTask } from './types';
import { loadState, saveState } from './services/storageService';
import { format } from 'date-fns';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import TransactionForm from './components/TransactionForm';
import Goals from './components/Goals';
import Accounts from './components/Accounts';
import DailyRoutine from './components/DailyRoutine';

const App: React.FC = () => {
  const [state, setState] = useState<FinanceState>(loadState());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleSaveTransaction = (data: Partial<Transaction>, isEdit: boolean) => {
    setState(prev => {
      let currentAccounts = [...prev.accounts];
      let currentTransactions = [...prev.transactions];

      if (isEdit && data.id) {
        const oldT = currentTransactions.find(t => t.id === data.id);
        if (oldT) {
          currentAccounts = currentAccounts.map(acc => {
            if (acc.id === oldT.accountId) {
              if (oldT.type === TransactionType.INCOME) return { ...acc, balance: acc.balance - oldT.amount };
              if (oldT.type === TransactionType.EXPENSE) return { ...acc, balance: acc.balance + oldT.amount };
              if (oldT.type === TransactionType.TRANSFER) return { ...acc, balance: acc.balance + oldT.amount };
            }
            if (oldT.type === TransactionType.TRANSFER && acc.id === oldT.toAccountId) {
              return { ...acc, balance: acc.balance - oldT.amount };
            }
            return acc;
          });
          currentTransactions = currentTransactions.filter(t => t.id !== data.id);
        }
      }

      const newTransaction: Transaction = {
        id: data.id || Math.random().toString(36).substr(2, 9),
        type: data.type!,
        amount: data.amount!,
        date: data.date!,
        category: data.category!,
        accountId: data.accountId!,
        toAccountId: data.toAccountId,
        classification: data.classification,
        description: data.description || '',
      };

      const finalAccounts = currentAccounts.map(acc => {
        if (acc.id === newTransaction.accountId) {
          if (newTransaction.type === TransactionType.INCOME) return { ...acc, balance: acc.balance + newTransaction.amount };
          if (newTransaction.type === TransactionType.EXPENSE) return { ...acc, balance: acc.balance - newTransaction.amount };
          if (newTransaction.type === TransactionType.TRANSFER) return { ...acc, balance: acc.balance - newTransaction.amount };
        }
        if (newTransaction.type === TransactionType.TRANSFER && acc.id === newTransaction.toAccountId) {
          return { ...acc, balance: acc.balance + newTransaction.amount };
        }
        return acc;
      });

      return {
        ...prev,
        accounts: finalAccounts,
        transactions: [newTransaction, ...currentTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    });
    
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setState(prev => {
      const t = prev.transactions.find(trans => trans.id === id);
      if (!t) return prev;

      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.id === t.accountId) {
          if (t.type === TransactionType.INCOME) return { ...acc, balance: acc.balance - t.amount };
          if (t.type === TransactionType.EXPENSE) return { ...acc, balance: acc.balance + t.amount };
          if (t.type === TransactionType.TRANSFER) return { ...acc, balance: acc.balance + t.amount };
        }
        if (t.type === TransactionType.TRANSFER && acc.id === t.toAccountId) {
          return { ...acc, balance: acc.balance - t.amount };
        }
        return acc;
      });

      return {
        ...prev,
        accounts: updatedAccounts,
        transactions: prev.transactions.filter(trans => trans.id !== id)
      };
    });
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setShowForm(true);
  };

  const handleAddGoal = (data: Partial<Goal>) => {
    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      ...data
    } as Goal;
    setState(prev => ({ ...prev, goals: [newGoal, ...prev.goals] }));
  };

  const handleDeleteGoal = (id: string) => {
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  };

  // Funções para Rotina
  const handleToggleRoutine = (id: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setState(prev => ({
      ...prev,
      routines: prev.routines.map(r => 
        r.id === id ? { ...r, completedDate: r.completedDate === today ? undefined : today } : r
      )
    }));
  };

  const handleAddRoutine = (data: Partial<DailyTask>) => {
    const newTask: DailyTask = {
      id: Math.random().toString(36).substr(2, 9),
      time: data.time!,
      description: data.description!,
    };
    setState(prev => ({ ...prev, routines: [...prev.routines, newTask] }));
  };

  const handleDeleteRoutine = (id: string) => {
    setState(prev => ({ ...prev, routines: prev.routines.filter(r => r.id !== id) }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={state.transactions} accounts={state.accounts} />;
      case 'transactions':
        return (
          <Transactions 
            transactions={state.transactions} 
            accounts={state.accounts} 
            onDelete={handleDeleteTransaction}
            onEdit={handleEditTransaction}
          />
        );
      case 'routines':
        return (
          <DailyRoutine 
            routines={state.routines} 
            onToggle={handleToggleRoutine}
            onAdd={handleAddRoutine}
            onDelete={handleDeleteRoutine}
          />
        );
      case 'goals':
        return <Goals goals={state.goals} onAdd={handleAddGoal} onDelete={handleDeleteGoal} />;
      case 'accounts':
        return <Accounts accounts={state.accounts} />;
      default:
        return <Dashboard transactions={state.transactions} accounts={state.accounts} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onAddClick={() => {
        setEditingTransaction(null);
        setShowForm(true);
      }}
    >
      {renderContent()}
      
      {showForm && (
        <TransactionForm 
          accounts={state.accounts} 
          transactions={state.transactions}
          initialData={editingTransaction}
          onSave={handleSaveTransaction} 
          onCancel={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }} 
        />
      )}
    </Layout>
  );
};

export default App;
