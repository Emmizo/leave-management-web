import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import leaveReducer from './leaveSlice';
import holidayReducer from './holidaySlice';
import leavePolicyReducer from './leavePolicySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leaves: leaveReducer,
    holidays: holidayReducer,
    leavePolicy: leavePolicyReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 