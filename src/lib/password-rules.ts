// Password rules shared by the browser (live checklist) and the server (real enforcement).
// Change a rule here and both sides follow.

export const PASSWORD_MIN_LENGTH = 8;
// bcrypt only uses the first 72 bytes of a password, so longer ones are rejected
export const PASSWORD_MAX_BYTES = 72;

export interface PasswordRule {
  id: "length" | "uppercase" | "number" | "special";
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (p) => p.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "number",
    label: "One number",
    test: (p) => /\d/.test(p),
  },
  {
    id: "special",
    label: "One special character",
    test: (p) => /[^A-Za-z0-9\s]/.test(p),
  },
];

// Returns an error message, or null when the password is acceptable
export function validateNewPassword(password: string): string | null {
  const failed = PASSWORD_RULES.find((rule) => !rule.test(password));
  if (failed) return `Password needs: ${failed.label.toLowerCase()}.`;
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    return `Password is too long (maximum ${PASSWORD_MAX_BYTES} bytes).`;
  }
  return null;
}
