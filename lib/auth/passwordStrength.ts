export const PASSWORD_RULES = [
  { id: 'length', label: '8 Chars', test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'A-Z', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'a-z', test: (v: string) => /[a-z]/.test(v) },
  { id: 'number', label: '123', test: (v: string) => /\d/.test(v) },
  { id: 'special', label: '@#$', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

export type PasswordStrengthLevel = 'empty' | 'weak' | 'medium' | 'strong';

export function getPasswordRuleStates(password: string) {
  return PASSWORD_RULES.map((rule) => ({
    ...rule,
    valid: rule.test(password),
  }));
}

export function getPasswordStrength(password: string): PasswordStrengthLevel {
  if (!password) return 'empty';
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed >= 5) return 'strong';
  if (passed >= 3) return 'medium';
  return 'weak';
}

export function strengthLabel(level: PasswordStrengthLevel) {
  switch (level) {
    case 'strong':
      return 'Strong';
    case 'medium':
      return 'Medium';
    case 'weak':
      return 'Weak';
    default:
      return '';
  }
}

export function strengthProgress(level: PasswordStrengthLevel) {
  switch (level) {
    case 'strong':
      return 100;
    case 'medium':
      return 65;
    case 'weak':
      return 35;
    default:
      return 0;
  }
}

export function strengthBarColor(level: PasswordStrengthLevel) {
  switch (level) {
    case 'strong':
      return 'bg-emerald-500';
    case 'medium':
      return 'bg-amber-500';
    case 'weak':
      return 'bg-red-500';
    default:
      return 'bg-zinc-200';
  }
}

export function strengthTextColor(level: PasswordStrengthLevel) {
  switch (level) {
    case 'strong':
      return 'text-emerald-600';
    case 'medium':
      return 'text-amber-600';
    case 'weak':
      return 'text-red-500';
    default:
      return 'text-zinc-400';
  }
}

export function isStrongPassword(password: string) {
  return PASSWORD_RULES.every((r) => r.test(password));
}
