export interface ChatContactDto {
  id: number;
  patientId: number;
  patientFirstName?: string | null;
  patientLastName?: string | null;
  fullName?: string | null;
  emailAddress?: string | null;
  mobileNumber?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  age: number;
  merchantId: number;
  readStatus: boolean;
  unreadCount: number;
  messageDate?: string | null;
  isSkySwitch: boolean;
  isWhatsapp: boolean;
  isUnknown: boolean;
}

export type ChatContactsListParams = {
  userId: string;
  pageIndex?: number;
  pageSize?: number;
  patientName?: string;
  patientNumber?: string;
  search?: string;
  filter?: string;
  selectedPatientCentralId?: number;
};

export type CreateChatContactRequest = {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  phoneNumber?: string | null;
  emailAddress?: string | null;
  dateOfBirth?: string | null;
};

export type CreateChatContactResponse = {
  success: boolean;
  message?: string | null;
  patientCentralId?: number | null;
  contact?: ChatContactDto | null;
};

export type UpdateChatContactRequest = {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  phoneNumber?: string | null;
  emailAddress?: string | null;
  dateOfBirth?: string | null;
};

export type UpdateChatContactResponse = {
  success: boolean;
  message?: string | null;
  patientCentralId: number;
  patient?: ChatPatientDetailDto | null;
  contact?: ChatContactDto | null;
};

export interface ChatContactsListResponse {
  items: ChatContactDto[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  totalUnreadCount: number;
}

export interface ChatContactCommunicationStats {
  calls: number;
  voicemails: number;
  faxes: number;
}

export interface ChatContactProfileSettings {
  notificationsMuted: boolean;
  isBlocked: boolean;
  alertId?: number | null;
}

export interface ChatContactProfileResponse {
  patientCentralId: number;
  initials?: string | null;
  fullName?: string | null;
  emailAddress?: string | null;
  mobileNumber?: string | null;
  phoneNumber?: string | null;
  phoneDisplay?: string | null;
  stats: ChatContactCommunicationStats;
  settings: ChatContactProfileSettings;
}

export type ChatContactProfileParams = {
  patientCentralId: string;
  userId: string;
};

export type ChatContactDetailParams = {
  patientCentralId: string;
  userId: string;
};

export interface ChatPatientDetailDto {
  id: number;
  patientId: number;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  emailAddress?: string | null;
  mobileNumber?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  age: number;
  sex?: string | null;
  address?: string | null;
  merchantId?: number | null;
  emailOptIn: boolean;
  textOptIn: boolean;
  voiceOptIn: boolean;
  pharmacyNumber?: string | null;
  isDirectWebsiteOrSms: boolean;
  isBirthDateConfirmation: boolean;
}

export type ChatOperationResponse = {
  success: boolean;
  message?: string | null;
};

export interface ContactCallItemDto {
  id: number;
  callerName?: string | null;
  callerPhone?: string | null;
  callerPhoneDisplay?: string | null;
  callType?: string | null;
  status?: string | null;
  route?: string | null;
  extension?: string | null;
  duration?: string | null;
  releaseReason?: string | null;
  callDate?: string | null;
}

export type ContactCallsListParams = {
  PharmacyId: number;
  FromDate?: string;
  ToDate?: string;
  Page?: number;
  PageSize?: number;
  Filter?: string;
};

export interface ContactCallsListResponse {
  success: boolean;
  message?: string | null;
  patientCentralId: number;
  appliedFilter?: string | null;
  pharmacyId?: number | null;
  contactPhone?: string | null;
  items?: ContactCallItemDto[] | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ContactVoicemailItemDto {
  id: number;
  direction?: string | null;
  callerName?: string | null;
  callerPhone?: string | null;
  callerPhoneDisplay?: string | null;
  route?: string | null;
  extension?: string | null;
  duration?: string | null;
  audioUrl?: string | null;
  fileName?: string | null;
  isRead: boolean;
  receivedAt?: string | null;
}

export type ContactVoicemailsListParams = {
  PharmacyId: number;
  FromDate?: string;
  ToDate?: string;
  Page?: number;
  PageSize?: number;
  Filter?: string;
};

export interface ContactVoicemailsListResponse {
  success: boolean;
  message?: string | null;
  patientCentralId: number;
  appliedFilter?: string | null;
  pharmacyId?: number | null;
  contactPhone?: string | null;
  items?: ContactVoicemailItemDto[] | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ContactFaxItemDto {
  id: number;
  direction?: string | null;
  contactPhone?: string | null;
  contactPhoneDisplay?: string | null;
  status?: string | null;
  displayStatus?: string | null;
  documentUrl?: string | null;
  imagePreviewUrl?: string | null;
  isRead: boolean;
  createdAt?: string | null;
}

export type ContactFaxesListParams = {
  PharmacyId: number;
  FromDate?: string;
  ToDate?: string;
  Page?: number;
  PageSize?: number;
  Filter?: string;
};

export interface ContactFaxesListResponse {
  success: boolean;
  message?: string | null;
  patientCentralId: number;
  appliedFilter?: string | null;
  pharmacyId?: number | null;
  contactPhone?: string | null;
  items?: ContactFaxItemDto[] | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
