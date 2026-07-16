import axios from "axios";

import type { ApiResponse } from "../types/common";

export const getApiErrorMessage = (
  error: any,
  fallback = "Something went wrong",
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};
