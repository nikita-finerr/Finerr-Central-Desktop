export interface PharmacyDetails {
  pharmacyId: number;
  pharmacyName: string;
  alternativeName: string | null;
  profilePicture: string | null;
  phoneNumber: string | null;
  faxNumber: string | null;
  emailAddress: string | null;
  streetAddress1: string | null;
  streetAddress2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  pharmacyNumber: string | null;
  ivrNumber: string | null;
  twilioNumber: string | null;
  isActive: boolean;
  userId: string | null;
  domainName?: string | null;
  apiKey?: string | null;
  sipUsername?: string | null;
  sipPassword?: string | null;
  sipExtension?: string | null;
  sipExtensionPassword?: string | null;
  sipHost?: string | null;
  sipWsUrl?: string | null;
  sipWssUrl?: string | null;
}

export interface FamilyProfile {
  profileId: number;
  displayName: string;
  relationship: string | null;
  role: string;
  roleId: number;
  permissions: string[];
}

/** Shape returned by GET /api/auth/me */
export interface UserData {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleId: number;
  merchantId: number;
  provider: string;
  pharmacy: PharmacyDetails | null;
  activeProfileId: number | null;
  activeProfileName: string | null;
  permissions: string[];
  profiles: FamilyProfile[];
}

export interface LoginResponseData {
  token: string;
  expiresAt: string;
}

export interface AuthState {
  userData: UserData | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/** Profile shape for /profile endpoints (separate from login session). */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}
