
import { FinanceState, Transaction, Account, Goal, DailyTask } from '../types';
import { ACCOUNTS_LIST } from '../constants';

const STORAGE_KEY = 'finance_pro_state_v1';

const getInitialState = (): FinanceState => {
  return {
    accounts: ACCOUNTS_LIST.map((name, index) => ({
      id: `acc-${index}`,
      name,
      balance: 0
    })),
    transactions: [],
    goals: [],
    routines: [
      { id: '1', time: '08:00', description: 'Abrir operações e conferir saldo' },
      { id: '2', time: '10:00', description: 'Produção ativa: Foco total' },
      { id: '3', time: '13:00', description: 'Encher sacolas de dinheiro (Meta do meio dia)' },
      { id: '4', time: '18:00', description: 'Fechamento de caixa e depósitos' },
      { id: '5', time: '20:00', description: 'Planejamento do dia seguinte' }
    ]
  };
};

export const loadState = (): FinanceState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return getInitialState();
  try {
    const parsed = JSON.parse(stored);
    return {
      ...getInitialState(), // Fallback para novas propriedades
      ...parsed
    };
  } catch (e) {
    console.error("Failed to load state", e);
    return getInitialState();
  }
};

export const saveState = (state: FinanceState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
