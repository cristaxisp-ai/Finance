
import React, { useState, useMemo, useEffect } from 'react';
import { TransactionType, Account, Transaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, EXPENSE_CLASSIFICATIONS } from '../constants';
import { X, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight } from 'lucide-react';

interface TransactionFormProps {
  accounts: Account[];
  transactions: Transaction[];
  initialData?: Transaction | null;
  onSave: (transaction: Partial<Transaction>, isEdit: boolean) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ accounts, transactions, initialData, onSave, onCancel }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || TransactionType.EXPENSE);
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [accountId, setAccountId] = useState(initialData?.accountId || accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(initialData?.toAccountId || '');
  const [classification, setClassification] = useState(initialData?.classification || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0]);

  // Se o tipo mudar, garantir que a categoria seja válida para o novo tipo
  useEffect(() => {
    if (!initialData) {
      setCategory('');
    }
  }, [type]);

  const sortedCategories = useMemo(() => {
    const baseList = type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const counts = transactions.reduce((acc, t) => {
      if (t.type === type) {
        acc[t.category] = (acc[t.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return [...baseList].sort((a, b) => {
      const countA = counts[a] || 0;
      const countB = counts[b] || 0;
      if (countB !== countA) return countB - countA;
      return a.localeCompare(b);
    });
  }, [type, transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId || (type === TransactionType.TRANSFER && !toAccountId)) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const isoDate = new Date(date + 'T12:00:00').toISOString();

    onSave({
      id: initialData?.id,
      type,
      amount: parseFloat(amount),
      category: type === TransactionType.TRANSFER ? 'Transferência' : category,
      accountId,
      toAccountId: type === TransactionType.TRANSFER ? toAccountId : undefined,
      classification: type === TransactionType.EXPENSE ? classification : undefined,
      description,
      date: isoDate,
    }, !!initialData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto no-scrollbar">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            {[
              { id: TransactionType.EXPENSE, label: 'Gasto', icon: ArrowDownCircle, active: 'bg-white text-rose-600 shadow-sm' },
              { id: TransactionType.INCOME, label: 'Ganho', icon: ArrowUpCircle, active: 'bg-white text-emerald-600 shadow-sm' },
              { id: TransactionType.TRANSFER, label: 'Transf.', icon: ArrowLeftRight, active: 'bg-white text-blue-600 shadow-sm' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  type === t.id ? t.active : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <t.icon size={18} />
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
              className="w-full text-3xl font-black text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 outline-none pb-2 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                {type === TransactionType.TRANSFER ? 'De Conta' : 'Conta'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            {type === TransactionType.TRANSFER && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Para Conta</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                  required
                >
                  <option value="">Selecionar...</option>
                  {accounts.filter(a => a.id !== accountId).map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {type !== TransactionType.TRANSFER && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                  required
                >
                  <option value="">Selecionar...</option>
                  {sortedCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {type === TransactionType.EXPENSE && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Classificação</label>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                    required
                  >
                    <option value="">Selecionar...</option>
                    {EXPENSE_CLASSIFICATIONS.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Opcional"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
          >
            {initialData ? 'Salvar Alterações' : 'Confirmar Lançamento'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
