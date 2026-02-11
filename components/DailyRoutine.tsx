
import React, { useState } from 'react';
import { DailyTask } from '../types';
import { CheckCircle2, Circle, Clock, Plus, Trash2, Trophy } from 'lucide-react';
import { format } from 'date-fns';

interface DailyRoutineProps {
  routines: DailyTask[];
  onToggle: (id: string) => void;
  onAdd: (task: Partial<DailyTask>) => void;
  onDelete: (id: string) => void;
}

const DailyRoutine: React.FC<DailyRoutineProps> = ({ routines, onToggle, onAdd, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');

  const completedToday = routines.filter(r => r.completedDate === today).length;
  const progress = routines.length > 0 ? (completedToday / routines.length) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time || !description) return;
    onAdd({ time, description });
    setTime('');
    setDescription('');
    setShowForm(false);
  };

  const sortedRoutines = [...routines].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Plano Diário</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"
        >
          {showForm ? 'Fechar' : <Plus size={20} />}
        </button>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Meta de Hoje</p>
            <h3 className="text-2xl font-black">Foco na Produção</h3>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl">
            <Trophy size={32} />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span>Progresso Diário</span>
            <span>{completedToday} de {routines.length} tarefas</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-[10px] font-bold opacity-80 uppercase">
            {progress === 100 ? 'Incrível! Meta batida!' : 'Continue acelerando!'}
          </p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-lg space-y-4 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Horário</label>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição</label>
              <input 
                type="text" 
                placeholder="Ex: Encher sacolas"
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Adicionar Tarefa</button>
        </form>
      )}

      {/* Timeline List */}
      <div className="relative space-y-4 before:content-[''] before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {sortedRoutines.map((task) => {
          const isCompleted = task.completedDate === today;
          return (
            <div 
              key={task.id} 
              className={`relative pl-12 flex items-center justify-between group transition-all duration-300 ${isCompleted ? 'opacity-60' : 'opacity-100'}`}
            >
              <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-slate-50 flex items-center justify-center transition-colors z-10 ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'}`}>
                {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
              </div>
              
              <div 
                onClick={() => onToggle(task.id)}
                className={`flex-1 flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
                  isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-tight ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {task.time}
                  </span>
                  <p className={`font-bold ${isCompleted ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>
                    {task.description}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => onDelete(task.id)}
                className="ml-2 p-2 text-slate-300 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}

        {routines.length === 0 && (
          <div className="pl-0 text-center py-12 text-slate-400">
            <Clock size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm">Nenhuma tarefa agendada para hoje.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyRoutine;
