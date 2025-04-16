import { Employee, Leave } from './auth'; // Assuming Employee and Leave types are in auth.ts

// Type for the payload when creating a leave request
export interface CreateLeavePayload {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string;   // Format: YYYY-MM-DD
  reason: string;
  type: Leave['type']; // Reuse the Leave type from auth.ts
  employeeId: number;
  // Optional: Add document field if handled via multipart/form-data in the same request
  // document?: File | null;
}

// Type for the response after successfully creating a leave
// Based on the example, but refining the nested employee/leaves slightly
export interface LeaveCreationResponse extends Leave {
  supportingDocumentPath?: string | null;
  // The nested employee in the response might not need the full leaves array again
  employee: Omit<Employee, 'leaves'> & { leaves: null }; // Or adjust based on actual response
}

// Type for the list of all employees response
export type AllEmployeesResponse = Employee[]; 