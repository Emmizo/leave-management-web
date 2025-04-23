import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Employee, EmployeeState } from '../types/employee';
import { RootState } from './store';
import { getAllEmployees, toggleEmployeeStatusApi } from '../services/employeeService'; // Import service functions

// Define a type for API error responses if possible, otherwise use a basic structure
interface ApiError {
  message: string;
}

// Async thunk for fetching employees - Uses service
export const fetchEmployees = createAsyncThunk('employees/fetchEmployees', async (_, { rejectWithValue }) => {
  try {
    const data = await getAllEmployees();
    return data;
  } catch (error: unknown) {
    let errorMessage = 'Failed to fetch employees';
    if (error instanceof Error) {
        // Check if it's an Axios error by checking for response property
        const potentialAxiosError = error as (Error & { response?: { data?: unknown } });
        if (potentialAxiosError.response?.data && typeof potentialAxiosError.response.data === 'object' && 'message' in potentialAxiosError.response.data) {
             // Try to assert the structure more safely
             const apiError = potentialAxiosError.response.data as ApiError;
             errorMessage = apiError.message || error.message;
        } else {
             errorMessage = error.message;
        }
    } 
    return rejectWithValue(errorMessage);
  }
});

// Async thunk for toggling employee status - Uses service
export const toggleEmployeeStatus = createAsyncThunk(
  'employees/toggleEmployeeStatus',
  async ({ userId, isEnabled }: { userId: number; isEnabled: boolean }, { rejectWithValue }) => {
    try {
      const data = await toggleEmployeeStatusApi(userId, isEnabled);
      return { userId, isEnabled, data }; 
    } catch (error: unknown) {
      let errorMessage = 'Failed to update employee status';
      if (error instanceof Error) {
        // Check if it's an Axios error by checking for response property
        const potentialAxiosError = error as (Error & { response?: { data?: unknown } });
        if (potentialAxiosError.response?.data && typeof potentialAxiosError.response.data === 'object' && 'message' in potentialAxiosError.response.data) {
             // Try to assert the structure more safely
             const apiError = potentialAxiosError.response.data as ApiError;
             errorMessage = apiError.message || error.message;
        } else {
             errorMessage = error.message;
        }
     } 
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState: EmployeeState = {
  employees: [],
  status: 'idle',
  error: null,
  updateStatus: 'idle',
  updateError: null,
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.status = 'succeeded';
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Toggle Employee Status
      .addCase(toggleEmployeeStatus.pending, (state, action) => {
        // Find employee by userId in meta.arg to potentially show row-specific loading
        const employeeToUpdate = state.employees.find(emp => emp.user.id === action.meta.arg.userId);
        if (employeeToUpdate) {
          // Add logic here if you want visual feedback on the specific row being updated
        }
        state.updateStatus = 'loading'; 
        state.updateError = null;
      })
      .addCase(toggleEmployeeStatus.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        // Find the index of the employee whose user.id matches the payload's userId
        const index = state.employees.findIndex(emp => emp.user.id === action.payload.userId);
        if (index !== -1) {
          state.employees[index].user.enabled = action.payload.isEnabled;
        }
      })
      .addCase(toggleEmployeeStatus.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.payload as string;
      });
  },
});

// Selectors
export const selectAllEmployees = (state: RootState) => state.employees.employees;
export const selectEmployeeStatus = (state: RootState) => state.employees.status;
export const selectEmployeeError = (state: RootState) => state.employees.error;
export const selectEmployeeUpdateStatus = (state: RootState) => state.employees.updateStatus;

export default employeeSlice.reducer; 