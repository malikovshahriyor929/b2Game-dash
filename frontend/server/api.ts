import axios, { AxiosError, type AxiosRequestConfig, isAxiosError } from "axios";

type BackendResponse<T> = { success: boolean; data: T; message?: string; errors?: unknown[] };

function backendBaseUrl() {
  return (process.env.BACKEND_URL ?? "http://127.0.0.1:4000").replace(/\/+$/, "");
}

function rigAdminBaseUrl() {
  return (process.env.RIG_ADMIN_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
}

function issueMessage(issue: unknown) {
  if (!issue || typeof issue !== "object") return "";
  const item = issue as { message?: unknown; path?: unknown };
  const message = typeof item.message === "string" ? item.message : "";
  if (!message) return "";
  const path = Array.isArray(item.path) ? item.path.filter(Boolean).join(".") : "";
  return path ? `${path}: ${message}` : message;
}

function compactHtmlMessage(message: string) {
  const trimmed = message.trim();
  if (!/^<!doctype html/i.test(trimmed) && !/^<html[\s>]/i.test(trimmed)) return trimmed;

  const ngrokOffline = trimmed.match(/endpoint\s+([a-z0-9-]+\.ngrok-free\.dev)\s+is\s+offline/i);
  if (trimmed.includes("ERR_NGROK_3200") || ngrokOffline) {
    return ngrokOffline
      ? `Ngrok endpoint offline: ${ngrokOffline[1]}. Rig admin serverni qayta ishga tushiring yoki .env dagi URLni yangilang.`
      : "Ngrok endpoint offline. Rig admin serverni qayta ishga tushiring yoki .env dagi URLni yangilang.";
  }

  const title = trimmed.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
  return title ? `Server HTML error qaytardi: ${title}` : "Server JSON o'rniga HTML error qaytardi.";
}

function cleanMessage(message: string) {
  const trimmed = message.trim();
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const payload = parsed as { message?: unknown; detail?: unknown; error?: unknown };
        const nested = payload.message ?? payload.detail ?? payload.error;
        if (typeof nested === "string" && nested.trim()) return cleanMessage(nested);
      }
    } catch {
      // Fall through to HTML/plain text cleanup.
    }
  }
  return compactHtmlMessage(trimmed);
}

export function axiosMessage(error: AxiosError) {
  const data = error.response?.data;
  if (data && typeof data === "object" && "message" in data) {
    const payload = data as { message?: unknown; errors?: unknown[] };
    const message = typeof payload.message === "string" && payload.message.trim() ? cleanMessage(payload.message) : "Backend request failed";
    const firstIssue = Array.isArray(payload.errors) ? payload.errors.map(issueMessage).find(Boolean) : "";
    return firstIssue ? `${message}: ${firstIssue}` : message;
  }
  if (typeof data === "string" && data.trim()) return cleanMessage(data);
  return error.message;
}

export const axiosInstance = axios.create({
  baseURL: "/api/backend",
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

export const appAxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

export const backendServerAxios = axios.create({
  baseURL: `${backendBaseUrl()}/api`,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
  validateStatus: () => true,
});

export const rigAdminServerAxios = axios.create({
  baseURL: `${rigAdminBaseUrl()}/api`,
  timeout: 30_000,
  headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
  validateStatus: () => true,
});

export async function backendRaw<T>(config: AxiosRequestConfig) {
  try {
    const response = await axiosInstance.request<BackendResponse<T>>(config);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) throw new Error(axiosMessage(error));
    throw error;
  }
}

export async function backendJson<T>(path: string, config?: AxiosRequestConfig) {
  const response = await backendRaw<T>({ ...config, url: path });
  if (response.success === false) {
    const firstIssue = Array.isArray(response.errors) ? response.errors.map(issueMessage).find(Boolean) : "";
    const message = response.message ? cleanMessage(response.message) : "Backend request failed";
    throw new Error(firstIssue ? `${message}: ${firstIssue}` : message);
  }
  return response.data;
}

export function backendGet<T>(path: string, config?: AxiosRequestConfig) {
  return backendJson<T>(path, { ...config, method: "GET" });
}

export function backendPost<T>(path: string, body: Record<string, unknown> = {}, config?: AxiosRequestConfig) {
  return backendJson<T>(path, { ...config, method: "POST", data: body });
}

export function backendPatch<T>(path: string, body: Record<string, unknown> = {}, config?: AxiosRequestConfig) {
  return backendJson<T>(path, { ...config, method: "PATCH", data: body });
}

export function backendDelete<T>(path: string, config?: AxiosRequestConfig) {
  return backendJson<T>(path, { ...config, method: "DELETE" });
}

export async function getBackendWsToken() {
  const response = await appAxiosInstance.get<BackendResponse<{ token: string }>>("/backend-ws-token");
  if (response.data.success === false) throw new Error(response.data.message ? cleanMessage(response.data.message) : "Backend token request failed");
  return response.data.data.token;
}
