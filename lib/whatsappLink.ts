/** Build a public WhatsApp chat link from a wa.me URL or phone number. */
export function whatsappHref(
  urlOrPhone?: string,
  fallbackPhone?: string
): string {
  const raw = (urlOrPhone || fallbackPhone || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // Local Tunisian mobiles are 8 digits — prefix country code
  if (digits.length === 8) digits = `216${digits}`;
  return `https://wa.me/${digits}`;
}
