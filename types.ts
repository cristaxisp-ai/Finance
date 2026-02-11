
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum GoalType {
  SHORT = 'Curto prazo',
  MEDIUM = 'Médio prazo',
  LONG = 'Longo prazo'
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO format
  category: string;
  accountId: string;
  toAccountId?: string; // For transfers
  classification?: string; // For expenses
  description: string;
}

export interface Goal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  type: GoalType;
}

export interface DailyTask {
  id: string;
  time: string;
  description: string;
  completedDate?: string; // ISO date string da última vez que foi completada
}

export interface FinanceState {
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  routines: DailyTask[];
}
