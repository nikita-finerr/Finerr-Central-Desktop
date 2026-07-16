import { Colors } from "../../../../constants";

export type ContactRoleTag = "Patient" | "Pharmacy" | "Doctor";

export type ContactRoleStyle = {
  color: string;
  backgroundColor: string;
};

const EXCLUDED_CONTACT_ROLES = new Set([
  "Clinic",
  "Laboratory",
  "Imaging",
  "Insurance",
]);

export const CONTACT_ROLE_STYLES: Record<ContactRoleTag, ContactRoleStyle> = {
  Patient: {
    color: Colors.primary,
    backgroundColor: `${Colors.primary}12`,
  },
  Doctor: {
    color: Colors.secondary,
    backgroundColor: `${Colors.secondary}12`,
  },
  Pharmacy: {
    color: "#DB2777",
    backgroundColor: "#DB277712",
  },
};

export const isExcludedContactRole = (role: string): boolean => {
  return EXCLUDED_CONTACT_ROLES.has(role);
};

export const getContactRoleTag = (role: string): ContactRoleTag => {
  if (role === "Patient") return "Patient";
  if (role === "Pharmacy") return "Pharmacy";
  return "Doctor";
};

export const getContactRoleStyle = (roleTag: ContactRoleTag): ContactRoleStyle => {
  return CONTACT_ROLE_STYLES[roleTag];
};

export const getContactRoleLabel = (roleTag: ContactRoleTag): string => {
  return roleTag;
};

export const getContactSpecialty = (
  role: string,
  roleTag: ContactRoleTag,
): string | undefined => {
  if (roleTag !== "Doctor") return undefined;
  return role;
};
