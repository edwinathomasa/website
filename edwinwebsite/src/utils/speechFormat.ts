const MONTH_NAMES: Record<string, string> = {
  '01': 'January',
  '1': 'January',
  '02': 'February',
  '2': 'February',
  '03': 'March',
  '3': 'March',
  '04': 'April',
  '4': 'April',
  '05': 'May',
  '5': 'May',
  '06': 'June',
  '6': 'June',
  '07': 'July',
  '7': 'July',
  '08': 'August',
  '8': 'August',
  '09': 'September',
  '9': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
};

/**
 * Replaces MM/YYYY date patterns (e.g., "06/2024") with full month name and year ("June 2024"),
 * and normalizes date range dashes ("June 2024 – Ongoing" -> "June 2024 to Ongoing")
 * so AI text and ElevenLabs speech pronounce periods naturally.
 */
export function formatPeriodsInText(text: string): string {
  const withMonthNames = text.replace(
    /\b(0?[1-9]|1[0-2])\/(\d{4})\b/g,
    (match, month: string, year: string) => {
      const monthName = MONTH_NAMES[month];
      return monthName ? `${monthName} ${year}` : match;
    }
  );

  return withMonthNames.replace(
    /\b([A-Za-z]+ \d{4}|\d{4})\s*[–—-]\s*([A-Za-z]+ \d{4}|\d{4}|Ongoing|Present)\b/gi,
    '$1 to $2'
  );
}
