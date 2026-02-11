
import React, { useMemo } from 'react';
import { Transaction, TransactionType, Account } from '../types';
import { isSameWeek, isSameMonth, format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, Wallet, CalendarDays, CalendarRange } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  accounts: Account[];
}

interface SummaryData {
  income: number;
  expense: number;
  balance: number;
}

const SummaryCard: React.FC<{ title: string, data: SummaryData, icon: React.ReactNode, type: 'week' | 'month' }> = ({ title, data, icon, type }) => {
  const getBgColor = () => {
    switch(type) {
      case 'week': return 'bg-indigo-50 border-indigo-100';
      case 'month': return 'bg-violet-50 border-violet-100';
    }
  };

  const getIconColor = () => {
    switch(type) {
      case 'week': return 'bg-indigo-100 text-indigo-600';
      case 'month': return 'bg-violet-100 text-violet-600';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className={`p-5 rounded-2xl border ${getBgColor()} shadow-sm space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getIconColor()}`}>
            {icon}
          </div>
          <h3 className="font-semibold text-slate-700">{title}</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Receitas</p>
          <p className="text-sm font-bold text-emerald-600">{formatCurrency(data.income)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Despesas</p>
          <p className="text-sm font-bold text-rose-500">{formatCurrency(data.expense)}</p>
        </div>
      </div>
      
      <div className="pt-3 border-t border-slate-200">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saldo do Período</p>
        <p className={`text-xl font-black ${data.balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
          {formatCurrency(data.balance)}
        </p>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ transactions, accounts }) => {
  const now = new Date();
  // String de hoje no formato local AAAA-MM-DD
  const todayStr = format(now, 'yyyy-MM-dd');

  const getSummary = (period: 'day' | 'week' | 'month'): SummaryData => {
    return transactions.reduce((acc, t) => {
      // Data da transação parseada com segurança
      const tDate = parseISO(t.date);
      const tDateStr = format(tDate, 'yyyy-MM-dd');
      
      let match = false;
      if (period === 'day') {
        match = tDateStr === todayStr;
      } else if (period === 'week') {
        match = isSameWeek(tDate, now, { weekStartsOn: 0 });
      } else if (period === 'month') {
        match = isSameMonth(tDate, now);
      }

      if (match) {
        if (t.type === TransactionType.INCOME) {
          acc.income += t.amount;
          acc.balance += t.amount;
        } else if (t.type === TransactionType.EXPENSE) {
          acc.expense += t.amount;
          acc.balance -= t.amount;
        }
      }
      return acc;
    }, { income: 0, expense: 0, balance: 0 });
  };

  const daily = useMemo(() => getSummary('day'), [transactions, todayStr]);
  const weekly = useMemo(() => getSummary('week'), [transactions]);
  const monthly = useMemo(() => getSummary('month'), [transactions]);

  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + curr.balance, 0);
  }, [accounts]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl shadow-xl shadow-indigo-200 text-white flex flex-col items-center">
        <p className="text-indigo-100 text-xs font-semibold uppercase tracking-widest mb-1">Balanço de Hoje</p>
        <h2 className="text-4xl font-black mb-4">
          {formatCurrency(daily.balance)}
        </h2>
        
        <div className="flex w-full gap-4 mt-2">
          <div className="flex-1 bg-white/10 backdrop-blur-sm p-3 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-emerald-400/20 rounded-xl text-emerald-400"><TrendingUp size={20} /></div>
            <div>
              <p className="text-[10px] text-white/60">Ganhos Hoje</p>
              <p className="text-sm font-bold">{formatCurrency(daily.income)}</p>
            </div>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-sm p-3 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-rose-400/20 rounded-xl text-rose-400"><TrendingDown size={20} /></div>
            <div>
              <p className="text-[10px] text-white/60">Gastos Hoje</p>
              <p className="text-sm font-bold">{formatCurrency(daily.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-slate-400" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Saldo Geral Acumulado</p>
        </div>
        <p className="text-sm font-black text-slate-700">{formatCurrency(totalBalance)}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CalendarRange size={20} className="text-indigo-600" />
          Resumos de Período
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard title="Resumo da Semana" data={weekly} icon={<CalendarDays size={20} />} type="week" />
          <SummaryCard title="Resumo do Mês" data={monthly} icon={<CalendarRange size={20} />} type="month" />
        </div>
      </div>

      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
          Sincronizado: {format(now, 'dd/MM/yyyy HH:mm')}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
