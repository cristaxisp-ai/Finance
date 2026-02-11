
import React, { useState, useRef } from 'react';
import { Transaction, TransactionType, Account } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Trash2, Edit2, ReceiptText } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const SwipeableItem: React.FC<{
  t: Transaction;
  getAccountName: (id: string) => string;
  formatCurrency: (val: number) => string;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}> = ({ t, getAccountName, formatCurrency, onEdit, onDelete }) => {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const startX = useRef(0);
  
  const actionWidth = 160; // Largura total dos botões (80px cada)
  const threshold = -60;

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX - swipeX;
    setIsSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Só permite arrastar para a esquerda
    if (diff < 0) {
      setSwipeX(diff);
    } else {
      setSwipeX(0);
    }
  };

  const onTouchEnd = () => {
    setIsSwiping(false);
    
    // Se arrastou mais de 50% da tela, deleta direto
    if (swipeX < -window.innerWidth * 0.5) {
      confirmDelete();
    } else if (swipeX < threshold) {
      // Fixa o menu aberto
      setSwipeX(-actionWidth);
    } else {
      // Fecha o menu
      setSwipeX(0);
    }
  };

  const confirmDelete = () => {
    if (window.confirm('Deseja excluir este lançamento?')) {
      setIsExiting(true);
      setTimeout(() => onDelete(t.id), 300);
    } else {
      setSwipeX(0);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(t);
    setSwipeX(0);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${isExiting ? 'opacity-0 scale-95 translate-x-full h-0 mb-0' : 'h-auto mb-3'}`}>
      
      {/* Camada Principal do Card (Fica embaixo mas captura o gesto) */}
      <div 
        className="relative z-10 bg-white p-4 border border-slate-100 shadow-sm flex items-center gap-4 select-none touch-pan-y"
        style={{ 
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={`p-3 rounded-2xl shrink-0 ${
          t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 
          t.type === TransactionType.EXPENSE ? 'bg-rose-50 text-rose-600' : 
          'bg-blue-50 text-blue-600'
        }`}>
          {t.type === TransactionType.INCOME ? <ArrowUpCircle size={24} /> : 
           t.type === TransactionType.EXPENSE ? <ArrowDownCircle size={24} /> : 
           <ArrowLeftRight size={24} />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-800 truncate text-sm sm:text-base">
              {t.description || t.category}
            </h4>
            <p className={`font-black whitespace-nowrap ml-2 ${
              t.type === TransactionType.INCOME ? 'text-emerald-600' : 
              t.type === TransactionType.EXPENSE ? 'text-rose-600' : 
              'text-blue-600'
            }`}>
              {t.type === TransactionType.EXPENSE ? '- ' : t.type === TransactionType.INCOME ? '+ ' : ''}
              {formatCurrency(t.amount)}
            </p>
          </div>
          
          <div className="flex justify-between items-end mt-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
              {format(new Date(t.date), "dd 'de' MMM", { locale: ptBR })} • {getAccountName(t.accountId)}
              {t.type === TransactionType.TRANSFER && ` → ${getAccountName(t.toAccountId!)}`}
              {t.classification && ` • ${t.classification}`}
            </p>
          </div>
        </div>
      </div>

      {/* Botões de Ação (Aparecem atrás do card ao arrastar, mas ficam no topo para clique) */}
      <div 
        className="absolute top-0 right-0 bottom-0 flex z-20"
        style={{ 
          pointerEvents: swipeX < threshold ? 'auto' : 'none',
          opacity: swipeX < -10 ? 1 : 0
        }}
      >
        <button 
          onClick={handleEdit}
          className="w-[80px] bg-amber-400 text-white flex flex-col items-center justify-center gap-1 active:brightness-90 transition-all"
        >
          <Edit2 size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-widest">Editar</span>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); confirmDelete(); }}
          className="w-[80px] bg-rose-500 text-white flex flex-col items-center justify-center gap-1 active:brightness-90 transition-all"
        >
          <Trash2 size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-widest">Excluir</span>
        </button>
      </div>

    </div>
  );
};

const Transactions: React.FC<TransactionsProps> = ({ transactions, accounts, onDelete, onEdit }) => {
  const [filter, setFilter] = useState<'ALL' | TransactionType>('ALL');

  const filtered = transactions
    .filter(t => filter === 'ALL' || t.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Conta';
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-slate-800">Lançamentos</h2>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as any)}
          className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg outline-none border border-indigo-100"
        >
          <option value="ALL">Todos</option>
          <option value={TransactionType.INCOME}>Ganhos</option>
          <option value={TransactionType.EXPENSE}>Gastos</option>
          <option value={TransactionType.TRANSFER}>Transf.</option>
        </select>
      </div>

      <div className="px-1 mb-2">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Arraste um item para a esquerda para excluir
        </p>
      </div>

      <div className="space-y-1">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <ReceiptText size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium">Nenhum lançamento registrado.</p>
          </div>
        ) : (
          filtered.map((t) => (
            <SwipeableItem 
              key={t.id} 
              t={t} 
              getAccountName={getAccountName}
              formatCurrency={formatCurrency}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;
