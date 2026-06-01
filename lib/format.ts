export function money(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

export function minutes(value: number) {
  if (value <= 0) return "00:00";
  const h = Math.floor(value / 60);
  const m = value % 60;
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}
