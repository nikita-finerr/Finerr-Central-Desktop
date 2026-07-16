import type { ApiResponse } from "./common";

export interface FaxDto {
  id: number;
  telnyxFaxId?: string | null;
  direction?: string | null;
  fromNumber?: string | null;
  toNumber?: string | null;
  status?: string | null;
  documentUrl?: string | null;
  mediaUrl?: string | null;
  imagePreviewUrl?: string | null;
  pageCount?: number | null;
  pharmacyId: number;
  failureReason?: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaxPagedResult {
  items: FaxDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  unreadCount: number;
}

export type FaxListResponse = ApiResponse<FaxPagedResult>;

export type FaxListParams = {
  PharmacyId: number;
  Direction?: string;
  Status?: string;
  Search?: string;
  StatusFilter?: string;
  PhoneNumber?: string;
  FromDate?: string;
  ToDate?: string;
  Page?: number;
  PageSize?: number;
};

export type SendFaxDocument = {
  uri: string;
  name: string;
  mimeType?: string | null;
};

export type SendFaxParams = {
  pharmacyId: number;
  toNumber: string;
  fromNumber: string;
  coverNote?: string;
  requestDeliveryConfirmation: boolean;
  document: SendFaxDocument;
};

export type SendFaxResponse = ApiResponse<FaxDto>;

export type ResendFaxParams = {
  pharmacyId: number;
};

export type ResendFaxResponse = ApiResponse<FaxDto>;

export type MarkFaxReadParams = {
  pharmacyId: number;
  telnyxFaxId?: string;
};

export type MarkFaxReadResponse = {
  success: boolean;
  message?: string | null;
  faxId: number;
  isRead: boolean;
};

export interface TelnyxFaxNumberDto {
  id: number;
  pharmacyId: number;
  faxNumber?: string | null;
  normalizedFaxNumber?: string | null;
  displayName?: string | null;
  telnyxPhoneNumberId?: string | null;
  connectionId?: string | null;
  provider?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface TelnyxFaxNumberListResult {
  items?: TelnyxFaxNumberDto[] | null;
  totalCount: number;
}

export type TelnyxFaxTableListResponse = ApiResponse<TelnyxFaxNumberListResult>;

export type TelnyxFaxTableListParams = {
  pharmacyId: number;
  includeInactive?: boolean;
};
