import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import axios from 'axios';
import { LeavePolicy } from '../types/leavePolicy';
import { RootState } from './store';

interface LeavePolicyState {
  policies: LeavePolicy[];
  loading: boolean;
  error: string | null;
}

const initialState: LeavePolicyState = {
  policies: [],
  loading: false,
  error: null,
};

export const fetchLeavePolicies = createAsyncThunk(
  'leavePolicy/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching leave policies');
      const response = await api.get<LeavePolicy[]>('/leave-policies');
      console.log('Leave policies response:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching leave policies:', error);
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch leave policies');
      }
      return rejectWithValue('Failed to fetch leave policies');
    }
  }
);

export const createLeavePolicy = createAsyncThunk(
  'leavePolicy/create',
  async (policy: Omit<LeavePolicy, 'id'>) => {
    const response = await api.post<LeavePolicy>('/leave-policies', policy);
    return response.data;
  }
);

export const updateLeavePolicy = createAsyncThunk(
  'leavePolicy/update',
  async (policy: LeavePolicy) => {
    const response = await api.put<LeavePolicy>(`/leave-policies/${policy.id}`, policy);
    return response.data;
  }
);

export const deleteLeavePolicy = createAsyncThunk(
  'leavePolicy/delete',
  async (id: number) => {
    await api.delete(`/leave-policies/${id}`);
    return id;
  }
);

const leavePolicySlice = createSlice({
  name: 'leavePolicy',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeavePolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeavePolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload;
        state.error = null;
      })
      .addCase(fetchLeavePolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createLeavePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLeavePolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policies.push(action.payload);
      })
      .addCase(createLeavePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create leave policy';
      })
      .addCase(updateLeavePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeavePolicy.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.policies.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.policies[index] = action.payload;
        }
      })
      .addCase(updateLeavePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update leave policy';
      })
      .addCase(deleteLeavePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLeavePolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = state.policies.filter(p => p.id !== action.payload);
      })
      .addCase(deleteLeavePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete leave policy';
      });
  },
});

export const selectAllLeavePolicies = (state: RootState) => state.leavePolicy.policies;
export const selectLeavePolicyStatus = (state: RootState) => state.leavePolicy.loading;
export const selectLeavePolicyError = (state: RootState) => state.leavePolicy.error;

export default leavePolicySlice.reducer; 