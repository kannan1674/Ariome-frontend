/** Resolve ISO 3166-1 alpha-2 from common country option shapes. */
export function resolveCountryIso2(country?: {
  iso2?: string;
  CountryCode?: string;
  Id?: string;
  Code?: string;
} | null): string {
  const candidates = [country?.iso2, country?.CountryCode, country?.Id];
  for (const c of candidates) {
    const v = String(c || '')
      .trim()
      .toUpperCase();
    if (/^[A-Z]{2}$/.test(v)) return v;
  }
  return '';
}

/** Convert ISO2 → regional-indicator flag emoji (e.g. IN → 🇮🇳). */
export function iso2ToFlagEmoji(iso2?: string | null): string {
  const code = String(iso2 || '')
    .trim()
    .toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return '🌐';
  return String.fromCodePoint(
    ...[...code].map((ch) => 0x1f1e6 - 65 + ch.charCodeAt(0)),
  );
}

export function countryFlagEmoji(
  country?: {
    iso2?: string;
    CountryCode?: string;
    Id?: string;
  } | null,
): string {
  return iso2ToFlagEmoji(resolveCountryIso2(country));
}

export function countryDialLabel(country?: {
  DialDisplay?: string;
  dialCode?: string;
  Code?: string;
} | null): string {
  if (country?.DialDisplay) return country.DialDisplay;
  if (country?.dialCode) {
    const d = String(country.dialCode).trim();
    return d.startsWith('+') ? d : `+${d}`;
  }
  if (country?.Code) return `+${String(country.Code).replace(/\D/g, '')}`;
  return '+91';
}

type DialCountry = {
  Id?: string;
  Code?: string;
  DialDisplay?: string;
  dialCode?: string;
  CountryCode?: string;
  iso2?: string;
};

/** Split an E.164 / stored phone into country option + national digits. */
export function splitPhoneNumber(
  phone: string | null | undefined,
  countries: DialCountry[] = [],
): { countryId: string; national: string } {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) {
    return { countryId: 'IN', national: '' };
  }

  const sorted = [...countries].sort((a, b) => {
    const da = String(a.Code || '').replace(/\D/g, '').length;
    const db = String(b.Code || '').replace(/\D/g, '').length;
    return db - da;
  });

  for (const c of sorted) {
    const code = String(c.Code || '').replace(/\D/g, '');
    if (code && digits.startsWith(code) && digits.length > code.length) {
      return {
        countryId: String(c.Id || c.iso2 || c.CountryCode || 'IN'),
        national: digits.slice(code.length),
      };
    }
  }

  if (digits.length === 10) {
    return { countryId: 'IN', national: digits };
  }
  if (digits.startsWith('91') && digits.length > 10) {
    return { countryId: 'IN', national: digits.slice(2) };
  }

  return { countryId: 'IN', national: digits };
}
