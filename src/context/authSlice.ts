// src/context/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';
import { Employee, LoginResponse, ProfileResponse } from '../types/auth';
import axios from 'axios';

// Export the interface
export interface AuthState {
  user: Employee | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'), // Initialize token from localStorage
  isAuthenticated: !!localStorage.getItem('authToken'),
  status: 'idle',
  error: null,
};

// Define the type for login credentials
interface LoginCredentials {
  username: string;
  password: string;
}

// Async Thunk for Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      localStorage.setItem('authToken', response.data.token);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Login failed';
      if (axios.isAxiosError(error) && error.response) {
        // Assuming the error response has a message property
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for Fetching User Profile (/me)
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as { auth: AuthState };
    if (!state.auth.token) {
      return rejectWithValue('No token found');
    }
    try {
      const response = await api.get<ProfileResponse>('/auth/me');
      return response.data;
    } catch (error: unknown) {
      // If fetching user fails (e.g., token expired), log out
      localStorage.removeItem('authToken');
      let errorMessage = 'Failed to fetch user profile';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('authToken');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Reducers
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Fetch User Profile Reducers
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading'; // Indicate loading user profile
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<ProfileResponse>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true; // Ensure authenticated state if profile fetch succeeds
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null; // Clear token if fetch fails
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer; 