import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type MessageState = {
  unreadCount: number;
};

const initialState: MessageState = {
  unreadCount: 0,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
});

export const { setUnreadCount } = messageSlice.actions;
export default messageSlice.reducer;
