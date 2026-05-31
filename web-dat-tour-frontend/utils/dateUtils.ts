/**
 * Timezone-aware date parser
 * If the date string from the backend represents UTC but lacks a timezone suffix (e.g. serialized LocalDateTime),
 * this function appends 'Z' to ensure it's parsed as UTC in the browser, rather than local time.
 */
export function parseUtcDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  try {
    const trimmed = dateStr.trim();
    if (!trimmed) return null;

    // Check if it already has a timezone indicator (e.g. 'Z', '+', or '-' offset like -05:00 at the end)
    const hasTimezone = trimmed.includes("Z") || trimmed.includes("+") || /-\d{2}:\d{2}$/.test(trimmed);
    if (hasTimezone) {
      const d = new Date(trimmed);
      return isNaN(d.getTime()) ? null : d;
    }

    // E.g. "2026-05-31T06:34:00" -> treat as UTC by appending "Z"
    if (trimmed.includes("T")) {
      const d = new Date(`${trimmed}Z`);
      return isNaN(d.getTime()) ? null : d;
    }

    // E.g. "2026-05-31 06:34:00" -> treat as UTC
    if (trimmed.includes(" ")) {
      const d = new Date(`${trimmed.replace(" ", "T")}Z`);
      return isNaN(d.getTime()) ? null : d;
    }

    // Pure date like "2026-06-15"
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/**
 * Formats a UTC date string to local date and time string in vi-VN locale
 */
export function formatUtcDateTime(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const date = parseUtcDate(dateStr);
  if (!date) return dateStr;
  try {
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats a UTC date string to local date only string in vi-VN locale
 */
export function formatUtcDateOnly(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const date = parseUtcDate(dateStr);
  if (!date) return dateStr;
  try {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
