import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';
import axios from 'axios';
import { RootState } from './store';

export interface Holiday {
  id: number;
  name: string;
  date: string;
  description: string;
  recurring: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface HolidayState {
  holidays: Holiday[];
  recurringHolidays: Holiday[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  deleteStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  deleteError: string | null;
}

const initialState: HolidayState = {
  holidays: [],
  recurringHolidays: [],
  status: 'idle',
  error: null,
  deleteStatus: 'idle',
  deleteError: null,
};

// Helper function to check if user has admin/HR permissions
const hasAdminPermissions = (state: RootState) => {
  const userRole = state.auth.user?.user?.role;
  console.log('Current user role:', userRole); // Add logging to debug
  return userRole === 'ADMIN' || userRole === 'HR_MANAGER';
};

// Fetch all holidays - Available to all users
export const fetchHolidays = createAsyncThunk(
  'holidays/fetchHolidays',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Holiday[]>('/holidays');
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch holidays';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch recurring holidays - Available to all users
export const fetchRecurringHolidays = createAsyncThunk(
  'holidays/fetchRecurringHolidays',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Holiday[]>('/holidays/recurring');
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch recurring holidays';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch holidays by date range - Available to all users
export const fetchHolidaysByDateRange = createAsyncThunk(
  'holidays/fetchHolidaysByDateRange',
  async ({ startDate, endDate }: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await api.get<Holiday[]>(`/holidays/date-range?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch holidays by date range';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Create a new holiday - Admin/HR only
export const createHoliday = createAsyncThunk(
  'holidays/createHoliday',
  async (holidayData: Omit<Holiday, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const hasPermission = hasAdminPermissions(state);
    console.log('Has permission to create:', hasPermission); // Add logging to debug
    if (!hasPermission) {
      return rejectWithValue('You do not have permission to create holidays');
    }
    try {
      const response = await api.post<Holiday>('/holidays', holidayData);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to create holiday';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Update a holiday - Admin/HR only
export const updateHoliday = createAsyncThunk(
  'holidays/updateHoliday',
  async ({ id, holidayData }: { id: number; holidayData: Partial<Holiday> }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!hasAdminPermissions(state)) {
      return rejectWithValue('You do not have permission to update holidays');
    }
    try {
      const response = await api.put<Holiday>(`/holidays/${id}`, holidayData);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to update holiday';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete a holiday - Admin/HR only
export const deleteHoliday = createAsyncThunk(
  'holidays/deleteHoliday',
  async (id: number, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!hasAdminPermissions(state)) {
      return rejectWithValue('You do not have permission to delete holidays');
    }
    try {
      const response = await api.delete<Holiday>(`/holidays/${id}`);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to delete holiday';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const holidaySlice = createSlice({
  name: 'holidays',
  initialState,
  reducers: {
    resetHolidayStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    resetDeleteStatus: (state) => {
      state.deleteStatus = 'idle';
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all holidays
      .addCase(fetchHolidays.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchHolidays.fulfilled, (state, action: PayloadAction<Holiday[]>) => {
        state.status = 'succeeded';
        state.holidays = action.payload;
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch holidays';
      })
      
      // Fetch recurring holidays
      .addCase(fetchRecurringHolidays.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRecurringHolidays.fulfilled, (state, action: PayloadAction<Holiday[]>) => {
        state.status = 'succeeded';
        state.recurringHolidays = action.payload;
      })
      .addCase(fetchRecurringHolidays.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch recurring holidays';
      })
      
      // Fetch holidays by date range
      .addCase(fetchHolidaysByDateRange.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchHolidaysByDateRange.fulfilled, (state, action: PayloadAction<Holiday[]>) => {
        state.status = 'succeeded';
        state.holidays = action.payload;
      })
      .addCase(fetchHolidaysByDateRange.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch holidays by date range';
      })
      
      // Create holiday
      .addCase(createHoliday.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createHoliday.fulfilled, (state, action: PayloadAction<Holiday>) => {
        state.status = 'succeeded';
        state.holidays.push(action.payload);
      })
      .addCase(createHoliday.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create holiday';
      })
      
      // Update holiday
      .addCase(updateHoliday.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateHoliday.fulfilled, (state, action: PayloadAction<Holiday>) => {
        state.status = 'succeeded';
        const index = state.holidays.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.holidays[index] = action.payload;
        }
      })
      .addCase(updateHoliday.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update holiday';
      })
      
      // Delete holiday
      .addCase(deleteHoliday.pending, (state) => {
        state.deleteStatus = 'loading';
        state.deleteError = null;
      })
      .addCase(deleteHoliday.fulfilled, (state, action: PayloadAction<Holiday>) => {
        state.deleteStatus = 'succeeded';
        state.holidays = state.holidays.filter(h => h.id !== action.payload.id);
      })
      .addCase(deleteHoliday.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deleteError = action.error.message || 'Failed to delete holiday';
      });
  },
});

export const { resetHolidayStatus, resetDeleteStatus } = holidaySlice.actions;

export default holidaySlice.reducer; 