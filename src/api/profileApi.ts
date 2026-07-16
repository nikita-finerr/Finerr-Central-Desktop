import { ApiEndpoints } from "../constants";
import type { ChangePasswordPayload } from "../types/auth";
import { makeApiRequest } from "./axiosConfig";

export const profileApi = {
  getProfile: () =>
    makeApiRequest(ApiEndpoints.profile.get, {}, { method: "GET" }),

  changePassword: (payload: ChangePasswordPayload) =>
    makeApiRequest(ApiEndpoints.profile.changePassword, payload),
};
