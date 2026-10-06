import { validateSignupPassword } from './passwordValidation';

describe('validateSignupPassword', () => {
  it('accepts passwords that satisfy the backend requirements', () => {
    expect(validateSignupPassword('Strong-password1')).toBeNull();
  });

  it('enforces the backend password length limits', () => {
    expect(validateSignupPassword('Short1!')).toBe('Password must be at least 12 characters long.');
    expect(validateSignupPassword(`A1!${'a'.repeat(126)}`)).toBe(
      'Password must be no more than 128 characters long.',
    );
  });

  it.each([
    ['lowercase-only1!', 'uppercase letter'],
    ['UPPERCASE-ONLY1!', 'lowercase letter'],
    ['Password-without-a-number!', 'digit'],
    ['PasswordWithoutSymbol1', 'non-letter/digit character'],
  ])('requires a %s', (password, requirement) => {
    expect(validateSignupPassword(password)).toContain(requirement);
  });

  it('does not treat a Unicode letter as the required non-letter/digit character', () => {
    expect(validateSignupPassword('Password1ééé')).toBe(
      'Password must include a non-letter/digit character.',
    );
  });
});
