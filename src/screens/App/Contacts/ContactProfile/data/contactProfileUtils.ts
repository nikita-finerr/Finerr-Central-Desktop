import {
  Calendar,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react-native";

import { Colors } from "../../../../../constants";
import type { ChatPatientDetailDto } from "../../../../../types/contact";
import { formatDate } from "../../../../../utils/dateUtils";
import { formatPhoneDisplay } from "../../../../../utils/formatPhoneNumber";

export type ContactInfoRow = {
  key: string;
  label: string;
  value: string;
  copyValue: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
};

const BLUE_ICON_STYLE = {
  iconColor: Colors.secondary,
  iconBackground: `${Colors.secondary}14`,
} as const;

export const getPatientDetailName = (patient: ChatPatientDetailDto): string =>
  patient.fullName?.trim() ||
  [patient.firstName, patient.lastName].filter(Boolean).join(" ").trim() ||
  "Unknown";

export const getPatientDetailPhone = (patient: ChatPatientDetailDto): string =>
  patient.phoneNumber ?? "";

export const getPatientDetailPhoneDisplay = (
  patient: ChatPatientDetailDto,
): string => formatPhoneDisplay(getPatientDetailPhone(patient));

export const getContactInformationRows = (
  patient: ChatPatientDetailDto,
): ContactInfoRow[] => {
  const rows: ContactInfoRow[] = [];
  const phone = getPatientDetailPhoneDisplay(patient);

  if (patient.phoneNumber?.trim()) {
    rows.push({
      key: "phone",
      label: "Phone Number",
      value: phone,
      copyValue: getPatientDetailPhone(patient),
      Icon: Phone,
      ...BLUE_ICON_STYLE,
    });
  }
  if (patient.mobileNumber?.trim()) {
    rows.push({
      key: "mobile",
      label: "Mobile Number",
      value: formatPhoneDisplay(patient?.mobileNumber),
      copyValue: patient.mobileNumber,
      Icon: Phone,
      ...BLUE_ICON_STYLE,
    });
  }

  if (patient.emailAddress?.trim()) {
    rows.push({
      key: "email",
      label: "Email Address",
      value: patient.emailAddress,
      copyValue: patient.emailAddress,
      Icon: Mail,
      ...BLUE_ICON_STYLE,
    });
  }

  if (patient.dateOfBirth) {
    rows.push({
      key: "dateOfBirth",
      label: "Date of Birth",
      value: formatDate(patient.dateOfBirth),
      copyValue: formatDate(patient.dateOfBirth),
      Icon: Calendar,
      ...BLUE_ICON_STYLE,
    });
  }

  if (patient.address?.trim()) {
    rows.push({
      key: "address",
      label: "Address",
      value: patient.address,
      copyValue: patient.address,
      Icon: MapPin,
      ...BLUE_ICON_STYLE,
    });
  }

  return rows;
};
