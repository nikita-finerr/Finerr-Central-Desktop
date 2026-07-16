import { ApiEndpoints } from "../constants";
import type {
  ForgotPasswordPayload,
  LoginCredentials,
  ResetPasswordPayload,
} from "../types/auth";
import { makeApiRequest } from "./axiosConfig";

export const authApi = {
  login: (credentials: LoginCredentials) =>
    makeApiRequest(ApiEndpoints.auth.login, credentials),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    makeApiRequest(ApiEndpoints.auth.forgotPassword, payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    makeApiRequest(ApiEndpoints.auth.resetPassword, payload),
};
