
export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'convert' | 'admin_deposit' | 'admin_withdrawal';
  status: 'completed' | 'pending' | 'failed';
  amount: number;
  currency: string;
  is_crypto: boolean;
  recipient_id?: string;
  sender_id?: string;
  user_id: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionPayload {
  recipient_id: string;
  amount: number;
  currency: string;
  is_crypto: boolean;
  description?: string;
}

export interface UserBalance {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  last_updated: Date;
}
