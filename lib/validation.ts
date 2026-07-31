export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidEmail(value: string) {
  const email = value.trim();
  if (!email) return false;
  // Block angle brackets / control chars that show up in XSS-ish payloads
  if (/[<>\s]/.test(email)) return false;
  // Requires @ and a domain with a dot — avoids browser native tooltip wording
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(value: string) {
  const digits = digitsOnly(value);
  return digits.length === 8;
}
