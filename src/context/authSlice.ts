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
  loginType: 'username' | 'email';
}

// Async Thunk for Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Determine if the input is an email or username
      const isEmail = credentials.username.includes('@');
      const loginType = isEmail ? 'email' : 'username';
      
      const response = await api.post<LoginResponse>('/auth/login', {
        ...credentials,
        loginType
      });
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
      // Backend returns the URL as plain text, let's adjust the expected type
      const response = await api.post<string>('/auth/microsoft/login'); // Expect string
      console.log('Microsoft login response:', response.data);

      // Directly check if response.data (the URL string) exists
      if (!response.data) {
        throw new Error('No authorization URL received from server');
      }

      // Redirect using the URL string directly from response.data
      window.location.href = response.data;

      // This part is technically unreachable due to redirect, but good practice
      return null;
    } catch (error: unknown) {
      console.error('Microsoft login initiation failed:', error);
      let errorMessage = 'Failed to initiate Microsoft login';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      // If the error is the specific one we throw, use a clearer message
      if (error instanceof Error && error.message === 'No authorization URL received from server') {
        errorMessage = error.message; 
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Handle Microsoft callback action
export const handleMicrosoftCallback = createAsyncThunk(
  'auth/handleMicrosoftCallback',
  async (code: string, { rejectWithValue }) => {
    try {
      // Send the code to your backend to exchange for tokens
      const response = await api.post('/auth/microsoft/callback', { code });
      console.log('Microsoft callback response:', response.data);
      localStorage.setItem('authToken', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Microsoft callback error:', error);
      if (axios.isAxiosError(error) && error.response?.data) {
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

// Async Thunk for Updating User Profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<Employee>, { rejectWithValue, getState }) => {
    const state = getState() as { auth: AuthState };
    if (!state.auth.token) {
      return rejectWithValue('No authentication token found');
    }
    try {
      const response = await api.put<ProfileResponse>('/profile', profileData, {
        headers: {
          Authorization: `Bearer ${state.auth.token}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to update profile';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/change-password', passwords);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || 'Failed to change password');
      }
      return rejectWithValue('Failed to change password');
    }
  }
);

// Async Thunk for Updating Profile Picture
export const updateProfilePicture = createAsyncThunk(
  'auth/updateProfilePicture',
  async (formData: FormData, { rejectWithValue, getState }) => {
    const state = getState() as { auth: AuthState };
    if (!state.auth.token) {
      return rejectWithValue('No authentication token found');
    }
    try {
      const response = await api.put<ProfileResponse>('/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${state.auth.token}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to update profile picture';
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
      })
      // Update Profile Reducers
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<ProfileResponse>) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Update Profile Picture Reducers
      .addCase(updateProfilePicture.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action: PayloadAction<ProfileResponse>) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout, loginSuccess } = authSlice.actions;
export default authSlice.reducer; 