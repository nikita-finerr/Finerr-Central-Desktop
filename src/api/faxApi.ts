import { ApiEndpoints } from "../constants";
import type {
  FaxListParams,
  FaxListResponse,
  MarkFaxReadParams,
  MarkFaxReadResponse,
  ResendFaxParams,
  ResendFaxResponse,
  SendFaxResponse,
  TelnyxFaxTableListParams,
  TelnyxFaxTableListResponse,
} from "../types/fax";
import { makeApiRequest } from "./axiosConfig";

export const faxApi = {
  list: (params: FaxListParams) =>
    makeApiRequest(ApiEndpoints.fax.list, params, {
      method: "GET",
    }) as Promise<FaxListResponse>,

  send: (formData: FormData) =>
    makeApiRequest(ApiEndpoints.fax.send, formData, {
      method: "POST",
      contentType: "multipart/form-data",
    }) as Promise<SendFaxResponse>,

  resend: (id: number | string, params: ResendFaxParams) =>
    makeApiRequest(ApiEndpoints.fax.resend(id), params, {
      method: "POST",
      useQueryParams: true,
    }) as Promise<ResendFaxResponse>,

  markRead: (id: number | string, params: MarkFaxReadParams) =>
    makeApiRequest(ApiEndpoints.fax.markRead(id), params, {
      method: "PATCH",
      useQueryParams: true,
    }) as Promise<MarkFaxReadResponse>,

  listTelnyxFaxTable: (params: TelnyxFaxTableListParams) =>
    makeApiRequest(ApiEndpoints.fax.telnyxTable, params, {
      method: "GET",
    }) as Promise<TelnyxFaxTableListResponse>,
};
