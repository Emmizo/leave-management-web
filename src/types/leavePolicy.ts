export type LeaveType = 'PTO' | 'SICK' | 'COMPASSIONATE' | 'MATERNITY' | 'UNPAID';

export interface LeavePolicy {
  id: number;
  name: string;
  description: string;
  daysPerMonth: number;
  carryForwardDays: number;
  maxConsecutiveDays: number;
  minNoticeDays: number;
  requiresApproval: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeavePolicyState {
  policies: LeavePolicy[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  createError: string | null;
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateError: string | null;
  deleteStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  deleteError: string | null;
} 