// src/context/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';
import { Employee, LoginResponse, ProfileResponse } from '../types/auth';
import axios, { AxiosError } from 'axios';
import { initiateLoginWithMicrosoft } from '../services/authService';

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

// Login with Microsoft action
export const loginWithMicrosoft = createAsyncThunk(
  'auth/loginWithMicrosoft',
  async (_, { rejectWithValue }) => {
    try {
      initiateLoginWithMicrosoft();
      return null; // This action won't complete normally due to the redirect
    } catch (error: unknown) {
      console.error('Microsoft login initiation failed:', error);
      return rejectWithValue('Failed to initiate Microsoft login');
    }
  }
);

// Handle Microsoft callback action
export const handleMicrosoftCallback = createAsyncThunk(
  'auth/handleMicrosoftCallback',
  async (code: string, { rejectWithValue }) => {
    try {
      // Send the code to your backend to exchange for tokens
      const response = await api.post('/auth/microsoft', { code });
      console.log('Microsoft callback response:', response.data);
      localStorage.setItem('authToken', response.data.token);

      console.log('Microsoft callback response:', response.data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue('Failed to authenticate with Microsoft');
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
    loginSuccess: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.status = 'succeeded';
      state.error = null;
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
      // Microsoft Login Reducers
      .addCase(loginWithMicrosoft.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithMicrosoft.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(loginWithMicrosoft.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Microsoft callback cases
      .addCase(handleMicrosoftCallback.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(handleMicrosoftCallback.fulfilled, (state, action) => {
        state.status = 'idle';
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(handleMicrosoftCallback.rejected, (state, action) => {
        state.status = 'failed';
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

export const { logout, loginSuccess } = authSlice.actions;
export default authSlice.reducer; 