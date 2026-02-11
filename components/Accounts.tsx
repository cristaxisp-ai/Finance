
import React from 'react';
import { Account } from '../types';
import { Wallet, Landmark, CreditCard, Banknote } from 'lucide-react';

interface AccountsProps {
  accounts: Account[];
}

const Accounts: React.FC<AccountsProps> = ({ accounts }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const getAccountIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('dinheiro')) return <Banknote size={24} />;
    if (n.includes('banco')) return <Landmark size={24} />;
    if (n.includes('cartão')) return <CreditCard size={24} />;
    return <Wallet size={24} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-slate-800">Minhas Contas</h2>
      </div>

      {/* Card de Saldo Total Consolidade */}
      <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm flex flex-col items-center">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Patrimônio Total</p>
        <p className={`text-3xl font-black ${totalBalance >= 0 ? 'text-indigo-600' : 'text-rose-500'}`}>
          {formatCurrency(totalBalance)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.map((account) => (
          <div 
            key={account.id} 
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-200 transition-colors"
          >
            <div className={`p-3 rounded-xl ${account.balance >= 0 ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'}`}>
              {getAccountIcon(account.name)}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-tight">{account.name}</h3>
              <p className={`text-lg font-black ${account.balance >= 0 ? 'text-slate-800' : 'text-rose-500'}`}>
                {formatCurrency(account.balance)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="p-12 text-center text-slate-400">
          <Wallet size={48} className="mx-auto mb-4 opacity-20" />
          <p>Nenhuma conta cadastrada.</p>
        </div>
      )}
    </div>
  );
};

export default Accounts;
