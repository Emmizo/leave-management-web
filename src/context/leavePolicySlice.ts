import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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

const API_URL = 'http://localhost:5456/api/leave-policies';

export const fetchLeavePolicies = createAsyncThunk(
  'leavePolicy/fetchAll',
  async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get<LeavePolicy[]>(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
);

export const createLeavePolicy = createAsyncThunk(
  'leavePolicy/create',
  async (policy: Omit<LeavePolicy, 'id'>) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post<LeavePolicy>(API_URL, policy, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
);

export const updateLeavePolicy = createAsyncThunk(
  'leavePolicy/update',
  async (policy: LeavePolicy) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.put<LeavePolicy>(`${API_URL}/${policy.id}`, policy, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
);

export const deleteLeavePolicy = createAsyncThunk(
  'leavePolicy/delete',
  async (id: number) => {
    const token = localStorage.getItem('authToken');
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
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
      })
      .addCase(fetchLeavePolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch leave policies';
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