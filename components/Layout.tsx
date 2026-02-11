
import React from 'react';
import { LayoutDashboard, ReceiptText, Target, Wallet, PlusCircle, Clock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onAddClick }) => {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'transactions', label: 'Extrato', icon: ReceiptText },
    { id: 'routines', label: 'Rotina', icon: Clock },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'accounts', label: 'Contas', icon: Wallet },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600">FinancePro</h1>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
          FP
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-6">
        {children}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={onAddClick}
        className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20"
      >
        <PlusCircle size={32} />
      </button>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center shadow-2xl z-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon size={24} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
