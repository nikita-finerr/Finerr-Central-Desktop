import { callApi } from "../api/callApi";
import type { RecentCallsFilter } from "../screens/App/Calls/data/callRecords";
import type { CallsListParams, CallsListResponse } from "../types/call";

export const fetchCallHistory = (
  filter: RecentCallsFilter,
  params: CallsListParams,
): Promise<CallsListResponse> => {
  switch (filter) {
    case "Incoming Calls":
      return callApi.list({
        ...params,
        direction: "inbound",
      });
    case "Outgoing Calls":
      return callApi.list({
        ...params,
        direction: "outbound",
      });
    case "Missed Calls":
      return callApi.list({
        ...params,
        direction: "inbound",
        status: "no_answer",
      });
    default:
      return callApi.list(params);
  }
};

export const buildCallSearchParams = (
  searchQuery: string,
): Pick<CallsListParams, "phoneNumber"> => {
  const digits = searchQuery.replace(/\D/g, "");
  if (digits.length < 3) {
    return {};
  }

  return { phoneNumber: digits };
};
