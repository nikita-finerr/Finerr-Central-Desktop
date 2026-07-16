import { ApiEndpoints } from "../constants";
import type {
  ChatContactDetailParams,
  ChatContactProfileParams,
  ChatContactProfileResponse,
  ChatContactsListParams,
  ChatContactsListResponse,
  ChatOperationResponse,
  ChatPatientDetailDto,
  ContactCallsListParams,
  ContactCallsListResponse,
  ContactFaxesListParams,
  ContactFaxesListResponse,
  ContactVoicemailsListParams,
  ContactVoicemailsListResponse,
  CreateChatContactRequest,
  CreateChatContactResponse,
  UpdateChatContactRequest,
  UpdateChatContactResponse,
} from "../types/contact";
import { makeApiRequest } from "./axiosConfig";

export const contactApi = {
  contacts: (params: ChatContactsListParams) =>
    makeApiRequest(ApiEndpoints.contacts.contactsList, params, {
      method: "GET",
    }) as Promise<ChatContactsListResponse>,

  createChatContact: (userId: string, body: CreateChatContactRequest) =>
    makeApiRequest(ApiEndpoints.contacts.contactsList, body, {
      method: "POST",
      params: { userId },
    }) as Promise<CreateChatContactResponse>,

  getChatContact: ({ patientCentralId, userId }: ChatContactDetailParams) =>
    makeApiRequest(
      ApiEndpoints.contacts.chatContact(patientCentralId),
      { userId },
      { method: "GET" },
    ) as Promise<ChatPatientDetailDto>,

  deleteChatContact: ({ patientCentralId, userId }: ChatContactDetailParams) =>
    makeApiRequest(
      ApiEndpoints.contacts.chatContact(patientCentralId),
      {},
      {
        method: "DELETE",
        params: { userId },
      },
    ) as Promise<ChatOperationResponse>,

  updateChatContact: (
    patientCentralId: string,
    userId: string,
    body: UpdateChatContactRequest,
  ) =>
    makeApiRequest(ApiEndpoints.contacts.chatContact(patientCentralId), body, {
      method: "PUT",
      params: { userId },
    }) as Promise<UpdateChatContactResponse>,

  getChatContactProfile: ({
    patientCentralId,
    userId,
  }: ChatContactProfileParams) =>
    makeApiRequest(
      ApiEndpoints.contacts.chatProfile(patientCentralId),
      { userId },
      { method: "GET" },
    ) as Promise<ChatContactProfileResponse>,

  listCalls: (
    patientCentralId: string | number,
    params: ContactCallsListParams,
  ) =>
    makeApiRequest(ApiEndpoints.contacts.calls(patientCentralId), params, {
      method: "GET",
    }) as Promise<ContactCallsListResponse>,

  listVoicemails: (
    patientCentralId: string | number,
    params: ContactVoicemailsListParams,
  ) =>
    makeApiRequest(ApiEndpoints.contacts.voicemails(patientCentralId), params, {
      method: "GET",
    }) as Promise<ContactVoicemailsListResponse>,

  listFaxes: (patientCentralId: string | number, params: ContactFaxesListParams) =>
    makeApiRequest(ApiEndpoints.contacts.faxes(patientCentralId), params, {
      method: "GET",
    }) as Promise<ContactFaxesListResponse>,
};
