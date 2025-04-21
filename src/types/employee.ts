// src/types/employee.ts

// Payload for registering a new employee
export interface RegisterEmployeePayload {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  role: 'HR_MANAGER' | 'ADMIN' | 'STAFF';
}

// Assuming the API might return the created Employee object
// We can reuse the Employee type from auth.ts if the structure matches
// import { Employee } from './auth';
// export type RegisterEmployeeResponse = Employee; 