function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseBackendTimestamp(value?: string | null) {
  if (!value) return null;
  const normalized = value.replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function backendDate(value?: string | null) {
  const date = parseBackendTimestamp(value) ?? new Date();
  return localDate(date);
}

export function backendTime(value?: string | null) {
  const date = parseBackendTimestamp(value);
  if (!date) return new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

export function backendDateTime(value?: string | null) {
  const date = parseBackendTimestamp(value);
  return date ? date.toLocaleString("uz-UZ") : "";
}

export function localDateTimeWithOffset(date: string, time: string) {
  const value = new Date(`${date}T${time || "00:00"}:00`);
  const offsetMinutes = -value.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  return `${date}T${time || "00:00"}:00${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;
}

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
