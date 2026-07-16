import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type FaxState = {
  unreadCount: number;
};

const initialState: FaxState = {
  unreadCount: 0,
};

const faxSlice = createSlice({
  name: "fax",
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
});

export const { setUnreadCount } = faxSlice.actions;
export default faxSlice.reducer;
