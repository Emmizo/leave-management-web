import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import leaveReducer from './leaveSlice';
import holidayReducer from './holidaySlice';
import leavePolicyReducer from './leavePolicySlice';
import passwordResetReducer from './passwordResetSlice';
import employeeReducer from './employeeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leaves: leaveReducer,
    holidays: holidayReducer,
    leavePolicy: leavePolicyReducer,
    passwordReset: passwordResetReducer,
    employees: employeeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'auth/login/fulfilled', 
          'auth/register/fulfilled',
          'leaves/applyLeave/fulfilled', 
          'leaves/updateLeave/fulfilled',
          'leaves/fetchLeaveHistory/fulfilled', // Example, add others as needed
          'employees/fetchEmployees/fulfilled', // Add for employees
          'employees/toggleEmployeeStatus/fulfilled', // Add for employees update
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload.headers', 'payload.config', 'payload.request', 'error'],
        // Ignore these paths in the state
        ignoredPaths: [
          'auth.user.headers', 
          'auth.user.config', 
          'auth.user.request', 
          'leaves.leaves', // Example, review state structure
          'employees.employees' // Add employees state path
        ],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 