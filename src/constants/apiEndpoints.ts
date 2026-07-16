import { Env } from "./env";

export const API_BASE_URL = Env.BASE_URL;

export const ApiEndpoints = {
  auth: {
    login: "/api/auth/login",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
  },
  profile: {
    get: "/api/auth/me",
    changePassword: "/api/auth/change-password",
  },
  notifications: {
    list: "/api/notifications",
    markRead: (id: string) => `/api/notifications/${id}/read`,
    fcmToken: "/api/portal-users/me/fcm-token",
  },
  messages: {
    smsList: "/api/messages/sms",
    chatHistory: "/api/patient-central/chat/messages",
    chatMarkRead: "/api/patient-central/chat/messages/read",
    chatSend: "/api/patient-central/chat/send",
    chatSendMultipart: "/api/patient-central/chat/send/multipart",
  },
  calls: {
    list: "/api/calls",
    details: (id: string) => `/api/calls/${id}`,
  },
  fax: {
    list: "/api/faxes",
    send: "/api/faxes",
    resend: (id: number | string) => `/api/faxes/${id}/resend`,
    markRead: (id: number | string) => `/api/faxes/${id}/read`,
    telnyxTable: "/api/telnyx-fax-table",
  },
  contacts: {
    list: "/contacts",
    create: "/contacts",
    details: (id: string) => `/contacts/${id}`,
    update: (id: string) => `/contacts/${id}`,
    delete: (id: string) => `/contacts/${id}`,
    contactsList: "/api/patient-central/chat/contacts",
    chatContact: (patientCentralId: string | number) =>
      `/api/patient-central/chat/contacts/${patientCentralId}`,
    chatProfile: (patientCentralId: string) =>
      `/api/patient-central/chat/contacts/${patientCentralId}/profile`,
    calls: (patientCentralId: string | number) =>
      `/api/contacts/${patientCentralId}/calls`,
    voicemails: (patientCentralId: string | number) =>
      `/api/contacts/${patientCentralId}/voicemails`,
    faxes: (patientCentralId: string | number) =>
      `/api/contacts/${patientCentralId}/faxes`,
  },
} as const;
