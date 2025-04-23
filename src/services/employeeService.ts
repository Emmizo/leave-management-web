import api from './api';
import { Employee } from '../types/employee';

/**
 * Fetches all employees from the API.
 * @returns Promise<Employee[]>
 */
export const getAllEmployees = async (): Promise<Employee[]> => {
  const response = await api.get<Employee[]>('/employees');
  return response.data;
};

/**
 * Toggles the enabled status of an employee's user account.
 * API: PUT /api/employees/{userId}/status
 * @param userId The ID of the user associated with the employee.
 * @param isEnabled The desired enabled status (true/false).
 * @returns Promise<unknown> - Assuming the API might return the updated user/employee or just status.
 */
export const toggleEmployeeStatusApi = async (userId: number, isEnabled: boolean): Promise<unknown> => {
  // Use the correct endpoint path: /users/{userId}/status
  const response = await api.put(`/users/${userId}/status`, { enabled: isEnabled });
  return response.data; 
}; 