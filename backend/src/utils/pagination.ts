export function pagination(query: Record<string, unknown>) {
  const limit = Math.min(Math.max(Number(query.limit ?? 50), 1), 200);
  const page = Math.max(Number(query.page ?? 1), 1);
  return { limit, offset: (page - 1) * limit, page };
}
