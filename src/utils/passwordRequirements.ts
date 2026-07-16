export type PasswordRequirement = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: "minLength",
    label: "Minimum 6 characters",
    test: (password) => password.length >= 6,
  },
  {
    id: "uppercase",
    label: "At least 1 uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "At least 1 number",
    test: (password) => /\d/.test(password),
  },
  {
    id: "special",
    label: "At least 1 special character",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
  {
    id: "startsWithLetter",
    label: "Must start with a letter",
    test: (password) => /^[A-Za-z]/.test(password),
  },
];

export const getPasswordRequirementResults = (password: string) => {
  return PASSWORD_REQUIREMENTS.map((requirement) => ({
    ...requirement,
    met: requirement.test(password),
  }));
};

export const meetsPasswordRequirements = (password: string) => {
  return PASSWORD_REQUIREMENTS.every((requirement) =>
    requirement.test(password),
  );
};
