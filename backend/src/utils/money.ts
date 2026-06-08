export function toNumber(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function money(value: unknown) {
  return Math.round(toNumber(value) * 100) / 100;
}
