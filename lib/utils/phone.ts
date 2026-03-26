/**
 * Auto-formats a Malagasy phone number as the user types.
 * Target format: 03X XX XXX XX  (e.g. 034 12 345 67)
 *
 * Strips non-digit characters, then inserts spaces at positions 3, 5, 8.
 */
export function formatMalagasyPhone(raw: string): string {
  // Keep only digits
  const digits = raw.replace(/\D/g, '').slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 8)
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
}
