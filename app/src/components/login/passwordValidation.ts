export function validateSignupPassword(password: string): string | null {
  if (password.length < 12) return 'Password must be at least 12 characters long.';
  if (password.length > 128) return 'Password must be no more than 128 characters long.';
  if (!/\p{Lu}/u.test(password)) return 'Password must include an uppercase letter.';
  if (!/\p{Ll}/u.test(password)) return 'Password must include a lowercase letter.';
  if (!/\p{Nd}/u.test(password)) return 'Password must include a digit.';
  if (!Array.from(password).some((character) => !/[\p{L}\p{Nd}]/u.test(character))) {
    return 'Password must include a non-letter/digit character.';
  }

  return null;
}
