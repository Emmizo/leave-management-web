// src/context/leaveSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';
import { LeaveCreationResponse, AllEmployeesResponse } from '../types/leave';
import { Employee, Leave } from '../types/auth'; // Ensure Leave is imported
import axios from 'axios';
import { RegisterEmployeePayload } from '../types/employee'; // Import new type
import { RootState } from './store'; // Import RootState

export interface LeaveBalance {
  leaveType: string;
  name: string;
  daysAvailable: number;
  daysAllowed: number;
  status: string;
  colorCode: string;
}

export interface LeaveState {
  creationStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  creationError: string | null;
  lastCreatedLeave: LeaveCreationResponse | null;
  employees: Employee[];
  fetchEmployeesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  fetchEmployeesError: string | null;
  allHistory: Leave[];
  fetchHistoryStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  fetchHistoryError: string | null;
  registrationStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  registrationError: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  balances: LeaveBalance[];
  fetchBalancesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  fetchBalancesError: string | null;
}

const initialState: LeaveState = {
  creationStatus: 'idle',
  creationError: null,
  lastCreatedLeave: null,
  employees: [],
  fetchEmployeesStatus: 'idle',
  fetchEmployeesError: null,
  // Initialize history state
  allHistory: [],
  fetchHistoryStatus: 'idle',
  fetchHistoryError: null,
  // Initialize registration state
  registrationStatus: 'idle',
  registrationError: null,
  // Initialize status state
  status: 'idle',
  error: null,
  balances: [],
  fetchBalancesStatus: 'idle',
  fetchBalancesError: null,
};

// Async Thunk for Creating Leave
export const createLeave = createAsyncThunk(
  'leaves/createLeave',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post('/leaves', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file upload
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create leave');
      }
      return rejectWithValue('Failed to create leave');
    }
  }
);

// Async Thunk for Fetching All Employees (for Admin/HR)
export const fetchEmployees = createAsyncThunk(
  'leaves/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<AllEmployeesResponse>('/employees');
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch employees';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for Fetching All Leave History
export const fetchAllLeaveHistory = createAsyncThunk(
  'leaves/fetchAllLeaveHistory',
  async (_, { rejectWithValue }) => {
    try {
      // Use the correct endpoint: /leaves/history
      const response = await api.get<Leave[]>('/leaves/history');
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch leave history';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for Registering Employee
export const registerEmployee = createAsyncThunk(
  'leaves/registerEmployee',
  async (employeeData: RegisterEmployeePayload, { rejectWithValue }) => {
    try {
      // Update the endpoint URL here
      const response = await api.post<Employee>('/auth/register', employeeData);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to register employee';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Update leave status (approve/reject)
export const updateLeaveStatus = createAsyncThunk(
  'leaves/updateLeaveStatus',
  async ({ leaveId, status, rejectionReason }: { leaveId: number; status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userRole = state.auth.user?.user?.role;
    
    if (userRole !== 'ADMIN' && userRole !== 'HR_MANAGER') {
      return rejectWithValue('You do not have permission to update leave status');
    }

    try {
      const response = await api.put(`/leaves/${leaveId}/status`, {
        leaveId,
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : undefined
      });
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to update leave status';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for Fetching Leave Balances
export const fetchLeaveBalances = createAsyncThunk(
  'leaves/fetchBalances',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<LeaveBalance[]>('/leaves/balances');
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch leave balances';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for Deleting Leave
export const deleteLeave = createAsyncThunk(
  'leaves/deleteLeave',
  async (leaveId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/leaves/${leaveId}`);
      return leaveId;
    } catch (error: unknown) {
      let errorMessage = 'Failed to delete leave';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const leaveSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    // Reducer to reset creation status after showing a message, for example
    resetCreationStatus: (state) => {
      state.creationStatus = 'idle';
      state.creationError = null;
      state.lastCreatedLeave = null;
    },
    // Reducer to reset registration status
    resetRegistrationStatus: (state) => {
      state.registrationStatus = 'idle';
      state.registrationError = null;
    },
    resetLeaveStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Leave Reducers
      .addCase(createLeave.pending, (state) => {
        state.creationStatus = 'loading';
        state.creationError = null;
        state.lastCreatedLeave = null;
      })
      .addCase(createLeave.fulfilled, (state, action: PayloadAction<LeaveCreationResponse>) => {
        state.creationStatus = 'succeeded';
        state.lastCreatedLeave = action.payload; // Store the created leave details
      })
      .addCase(createLeave.rejected, (state, action) => {
        state.creationStatus = 'failed';
        state.creationError = action.payload as string;
      })
      // Fetch Employees Reducers
      .addCase(fetchEmployees.pending, (state) => {
        state.fetchEmployeesStatus = 'loading';
        state.fetchEmployeesError = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<AllEmployeesResponse>) => {
        state.fetchEmployeesStatus = 'succeeded';
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.fetchEmployeesStatus = 'failed';
        state.fetchEmployeesError = action.payload as string;
      })
      // Fetch All History Reducers
      .addCase(fetchAllLeaveHistory.pending, (state) => {
        state.fetchHistoryStatus = 'loading';
        state.fetchHistoryError = null;
      })
      .addCase(fetchAllLeaveHistory.fulfilled, (state, action: PayloadAction<Leave[]>) => {
        state.fetchHistoryStatus = 'succeeded';
        state.allHistory = action.payload;
      })
      .addCase(fetchAllLeaveHistory.rejected, (state, action) => {
        state.fetchHistoryStatus = 'failed';
        state.fetchHistoryError = action.payload as string;
      })
      // Register Employee Reducers
      .addCase(registerEmployee.pending, (state) => {
        state.registrationStatus = 'loading';
        state.registrationError = null;
      })
      .addCase(registerEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.registrationStatus = 'succeeded';
        // Optionally add the new employee to the employees list if needed immediately
        state.employees.push(action.payload); 
      })
      .addCase(registerEmployee.rejected, (state, action) => {
        state.registrationStatus = 'failed';
        state.registrationError = action.payload as string;
      })
      // Update leave status
      .addCase(updateLeaveStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the leave in allHistory if it exists
        const index = state.allHistory.findIndex(leave => leave.id === action.payload.id);
        if (index !== -1) {
          state.allHistory[index] = action.payload;
        }
      })
      .addCase(updateLeaveStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update leave status';
      })
      // Add leave balances reducers
      .addCase(fetchLeaveBalances.pending, (state) => {
        state.fetchBalancesStatus = 'loading';
        state.fetchBalancesError = null;
      })
      .addCase(fetchLeaveBalances.fulfilled, (state, action: PayloadAction<LeaveBalance[]>) => {
        state.fetchBalancesStatus = 'succeeded';
        state.balances = action.payload;
      })
      .addCase(fetchLeaveBalances.rejected, (state, action) => {
        state.fetchBalancesStatus = 'failed';
        state.fetchBalancesError = action.payload as string;
      })
      // Delete Leave Reducers
      .addCase(deleteLeave.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteLeave.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Remove the deleted leave from allHistory
        state.allHistory = state.allHistory.filter(leave => leave.id !== action.payload);
      })
      .addCase(deleteLeave.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetCreationStatus, resetRegistrationStatus, resetLeaveStatus } = leaveSlice.actions;
export default leaveSlice.reducer; 