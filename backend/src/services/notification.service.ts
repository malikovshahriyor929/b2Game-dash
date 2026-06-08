export function notificationPayload(type: string, data: unknown) {
  return { type, data, created_at: new Date().toISOString() };
}
