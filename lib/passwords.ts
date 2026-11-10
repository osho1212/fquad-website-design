export const MIN_PASSWORD_LENGTH = 12;

const KNOWN_WEAK = new Set(['changeme123', 'password', 'password123', 'admin123', 'fquad123']);

/** Returns a message describing what is wrong with `password`, or null if it is acceptable. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > 200) {
    return 'Use at most 200 characters.';
  }
  if (KNOWN_WEAK.has(password.toLowerCase())) {
    return 'That password is too common. Choose something unique.';
  }
  return null;
}
