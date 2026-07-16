import axios from "axios";
import { API_BASE_URL } from "../constants";
import { clearAuth } from "../redux/auth/authSlice";
import { store } from "../redux/store";
import { authStorage } from "../utils/storage";

export const makeApiRequest = async (
  endpoint: string,
  data = {},
  options: {
    contentType?: string;
    method?: string;
    useQueryParams?: boolean;
    baseUrl?: string;
    params?: Record<string, any>;
  } = {},
) => {
  const {
    contentType = "application/json",
    method = "POST",
    useQueryParams = false,
    baseUrl = API_BASE_URL,
    params = {},
  } = options;

  try {
    let headers: Record<string, string> = {};

    const token = (await authStorage.getAccessToken()) ?? "";
    // console.log("token", token);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (contentType === "multipart/form-data") {
      headers["Content-Type"] = "multipart/form-data";
    } else if (contentType === "application/json") {
      headers["Content-Type"] = "application/json";
    }

    const config = {
      method,
      url: baseUrl + endpoint,
      data: method === "GET" || useQueryParams ? undefined : data,
      params:
        method === "GET" || useQueryParams ? data : params ? params : undefined,
      headers,
      timeout: 60000,
    };
    const response = await axios(config);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      if (err.response?.status === 401) {
        await authStorage.clearAuth();
        store.dispatch(clearAuth());
      }

      return {
        status: err.response.status,
        message: err.response.data.message,
      };
    } else if (axios.isAxiosError(err) && err.request) {
      return {
        status: 0,
        message: "Network error",
      };
    } else {
      return {
        status: 0,
        message: "Failed to make request",
      };
    }
  }
};
