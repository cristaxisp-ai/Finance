
import React, { useState } from 'react';
import { Goal, GoalType } from '../types';
import { Target, Plus, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface GoalsProps {
  goals: Goal[];
  onAdd: (goal: Partial<Goal>) => void;
  onDelete: (id: string) => void;
}

const Goals: React.FC<GoalsProps> = ({ goals, onAdd, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [type, setType] = useState<GoalType>(GoalType.SHORT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name,
      targetValue: parseFloat(target),
      currentValue: parseFloat(current) || 0,
      deadline,
      type
    });
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setName(''); setTarget(''); setCurrent(''); setDeadline(''); setType(GoalType.SHORT);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Minhas Metas</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100"
        >
          {showForm ? 'Fechar' : 'Nova Meta'}
          {showForm ? null : <Plus size={18} />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-50 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Objetivo</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Viagem" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Prazo</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Valor Total</label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Já tenho</label>
              <input type="number" value={current} onChange={e => setCurrent(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value as GoalType)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option value={GoalType.SHORT}>Curto Prazo</option>
                <option value={GoalType.MEDIUM}>Médio Prazo</option>
                <option value={GoalType.LONG}>Longo Prazo</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Criar Meta</button>
        </form>
      )}

      <div className="space-y-4">
        {goals.map((g) => {
          const progress = Math.min((g.currentValue / g.targetValue) * 100, 100);
          return (
            <div key={g.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{g.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold uppercase">{g.type}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar size={12} /> {format(new Date(g.deadline), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>
                <button onClick={() => onDelete(g.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-indigo-600">{formatCurrency(g.currentValue)}</span>
                  <span className="text-slate-400">Meta: {formatCurrency(g.targetValue)}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-right text-xs font-black text-indigo-600">{progress.toFixed(0)}% concluído</p>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && !showForm && (
          <div className="p-12 text-center text-slate-400">
            <Target size={48} className="mx-auto mb-4 opacity-20" />
            <p>Você ainda não definiu metas financeiras.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
