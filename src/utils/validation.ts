import { meetsPasswordRequirements } from './passwordRequirements';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

export const isValidPassword = (password: string): boolean => password.length >= 8;

export const passwordsMatch = (password: string, confirmPassword: string): boolean =>
  password === confirmPassword;

export const validateLogin = (email: string, password: string): string | null => {
  if (!email.trim()) return 'Email is required';
  if (!isValidEmail(email)) return 'Please enter a valid email';
  if (!password.trim()) return 'Password is required';
  return null;
};

export const validateForgotPassword = (email: string): string | null => {
  if (!email.trim()) return 'Email is required';
  if (!isValidEmail(email)) return 'Please enter a valid email';
  return null;
};

export const validateResetPassword = (
  token: string,
  newPassword: string,
  confirmPassword: string,
): string | null => {
  if (!token.trim()) {
    return "Reset link is invalid or expired";
  }
  if (!newPassword.trim()) {
    return "New password is required";
  }
  if (!meetsPasswordRequirements(newPassword)) {
    return "New password does not meet all requirements";
  }
  if (!passwordsMatch(newPassword, confirmPassword)) {
    return "Passwords do not match";
  }
  return null;
};

export const validateChangePassword = (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): string | null => {
  if (!currentPassword.trim()) return 'Current password is required';
  if (!newPassword.trim()) return 'New password is required';
  if (!meetsPasswordRequirements(newPassword)) {
    return 'New password does not meet all requirements';
  }
  if (!passwordsMatch(newPassword, confirmPassword)) return 'Passwords do not match';
  if (currentPassword === newPassword) {
    return 'New password must be different from current password';
  }
  return null;
};

export const validateContact = (
  firstName: string,
  lastName: string,
  phone: string,
): string | null => {
  if (!firstName.trim()) return 'First name is required';
  if (!lastName.trim()) return 'Last name is required';
  if (!isValidPhone(phone)) return 'Please enter a valid phone number';
  return null;
};
