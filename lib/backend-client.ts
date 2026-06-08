type BackendResponse<T> = { success: boolean; data: T; message?: string };

export async function backendJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(`/api/backend${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const json = (await response.json()) as BackendResponse<T>;
  if (!response.ok || json.success === false) throw new Error(json.message || `Backend request failed: ${response.status}`);
  return json.data;
}

export function backendGet<T>(path: string) {
  return backendJson<T>(path);
}

export function backendPost<T>(path: string, body: Record<string, unknown>) {
  return backendJson<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function backendPatch<T>(path: string, body: Record<string, unknown>) {
  return backendJson<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export function backendDelete<T>(path: string) {
  return backendJson<T>(path, { method: "DELETE" });
}
