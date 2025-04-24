// src/types/employee.ts

// Define a minimal Leave type locally if not available elsewhere
interface Leave {
  id: number;
  // Add other essential fields if needed by Employee type context
}

// Payload for registering a new employee
export interface RegisterEmployeePayload {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  role: 'HR_MANAGER' | 'ADMIN' | 'STAFF';
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

// Assuming the API might return the created Employee object
// We can reuse the Employee type from auth.ts if the structure matches
// import { Employee } from './auth';
// export type RegisterEmployeeResponse = Employee; 

// Type for the nested user object
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'HR_MANAGER' | 'USER'; // Assuming these are the possible roles
  provider: string | null;
  providerId: string | null;
  enabled: boolean;
}

// Type for the main Employee object
export interface Employee {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  phone: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  annualLeaveBalance?: number; // Optional based on response
  microsoftId?: string | null; // Optional based on response
  user: User;
  leaves?: Leave[]; // Optional based on response, assuming Leave type is defined elsewhere
  createdAt: string | null;
}

// Type for the Employee state in Redux
export interface EmployeeState {
  employees: Employee[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed'; // For status toggle
  updateError: string | null;
} 