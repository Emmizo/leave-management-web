// src/context/leaveSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';
import { LeaveCreationResponse, AllEmployeesResponse } from '../types/leave';
import { Employee, Leave } from '../types/auth'; // Ensure Leave is imported
import axios from 'axios';
import { RegisterEmployeePayload } from '../types/employee'; // Import new type

interface LeaveState {
  // State for leave creation
  creationStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  creationError: string | null;
  lastCreatedLeave: LeaveCreationResponse | null;

  // State for fetching leaves/employees (can be expanded)
  employees: Employee[];
  fetchEmployeesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  fetchEmployeesError: string | null;

  // State for fetching all leave history
  allHistory: Leave[];
  fetchHistoryStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  fetchHistoryError: string | null;

  // State for employee registration
  registrationStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  registrationError: string | null;
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
};

// Async Thunk for Creating Leave
export const createLeave = createAsyncThunk(
  'leaves/createLeave',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      // Send the FormData directly. Axios will set the Content-Type header.
      const response = await api.post<LeaveCreationResponse>('/leaves', formData);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to create leave request';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      }
      return rejectWithValue(errorMessage);
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
      });
  },
});

export const { resetCreationStatus, resetRegistrationStatus } = leaveSlice.actions;
export default leaveSlice.reducer; 