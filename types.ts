
export interface Transaction {
  date: string;
  description: string;
  amount: number | string;
  notes: string;
}

export interface OCRResult {
  bankName?: string;
  period?: string;
  currency?: string;
  transactions: Transaction[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
