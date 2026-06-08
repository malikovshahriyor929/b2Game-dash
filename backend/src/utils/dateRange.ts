export function dateRange(query: Record<string, unknown>) {
  const now = new Date();
  const start = new Date(now);
  const period = String(query.period ?? "today");

  if (query.date_from && query.date_to) return { from: new Date(String(query.date_from)), to: new Date(String(query.date_to)) };
  if (period === "yesterday") {
    start.setDate(now.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { from: start, to: end };
  }
  if (period === "week") start.setDate(now.getDate() - 7);
  else if (period === "month") start.setMonth(now.getMonth() - 1);
  else if (period === "year") start.setFullYear(now.getFullYear() - 1);
  else start.setHours(0, 0, 0, 0);
  return { from: start, to: now };
}
