/** Khớp payment.office.hours-after-booking trên Payment-service */
export const OFFICE_HOURS_AFTER_BOOKING = 48;

export function officePaymentDueMs(fromMs: number): number {
  return fromMs + OFFICE_HOURS_AFTER_BOOKING * 60 * 60 * 1000;
}

export function formatDueMs(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";
  const dn = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()];
  return `${dn}, ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
