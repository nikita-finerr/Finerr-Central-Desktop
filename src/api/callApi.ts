import { ApiEndpoints } from "../constants";
import type {
  CallResponse,
  CallsListParams,
  CallsListResponse,
} from "../types/call";
import { makeApiRequest } from "./axiosConfig";

export const callApi = {
  list: (params: CallsListParams = {}) =>
    makeApiRequest(ApiEndpoints.calls.list, params, {
      method: "GET",
    }) as Promise<CallsListResponse>,

  getById: (id: string) =>
    makeApiRequest(
      ApiEndpoints.calls.details(id),
      {},
      {
        method: "GET",
      },
    ) as Promise<CallResponse>,
};
