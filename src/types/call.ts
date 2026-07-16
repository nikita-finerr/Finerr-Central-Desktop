import type { ApiResponse } from "./common";

export type CallDirection = "inbound" | "outbound";

export type CallStatus =
  | "initiated"
  | "ringing"
  | "answered"
  | "completed"
  | "failed"
  | "busy"
  | "no_answer";

export interface CallDto {
  id: string;
  telnyxCallControlId: string;
  direction: CallDirection;
  callerNumber: string;
  calleeNumber: string;
  contactName?: string;
  status: CallStatus;
  durationSeconds?: number;
  recordingUrl?: string;
  pharmacyId?: number;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type CallsListResponse = ApiResponse<PagedResult<CallDto>>;
export type CallResponse = ApiResponse<CallDto>;

export type CallsListParams = {
  pharmacyId?: number;
  direction?: CallDirection;
  status?: CallStatus;
  phoneNumber?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
};
