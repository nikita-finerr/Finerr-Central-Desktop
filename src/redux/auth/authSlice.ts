import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthState, UserData } from '../../types/auth';

const initialState: AuthState = {
  userData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.userData = action.payload;
    },
    clearAuth: (state) => {
      state.userData = null;
    },
  },
});

export const { setUserData, clearAuth } = authSlice.actions;
export default authSlice.reducer;
