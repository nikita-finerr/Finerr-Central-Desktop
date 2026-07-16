import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import faxReducer from "./fax/faxSlice";
import messageReducer from "./message/messageSlice";
import notificationReducer from "./notification/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    fax: faxReducer,
    message: messageReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
