export interface UserRole {
  id: number;
  username: string;
  email: string;
  role: 'STAFF' | 'HR_MANAGER' | 'ADMIN'; // Adjust roles as needed
  provider: string | null;
  providerId: string | null;
}

export interface Leave {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  type: 'PTO' | 'SICK' | 'COMPASSIONATE' | 'MATERNITY' | 'UNPAID'; // Adjust leave types as needed
  leaveDuration: 'FULL_DAY' | 'HALF_DAY';
  numberOfDays: number;
  employee?: Employee; // Employee might be null in some contexts?
}

export interface Employee {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  annualLeaveBalance: number;
  microsoftId: string | null;
  user: UserRole;
  leaves: Leave[] | null;
}

export interface LoginResponse {
  token: string;
  user: Employee;
}

// Alias for clarity when using the /me response
export type ProfileResponse = Employee; 