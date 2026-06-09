import axios, { AxiosError, type AxiosRequestConfig, isAxiosError } from "axios";

type BackendResponse<T> = { success: boolean; data: T; message?: string };

function backendBaseUrl() {
  return (process.env.BACKEND_URL ?? "http://127.0.0.1:4000").replace(/\/+$/, "");
}

function rigAdminBaseUrl() {
  return (process.env.RIG_ADMIN_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
}

function axiosMessage(error: AxiosError) {
  const data = error.response?.data;
  if (data && typeof data === "object" && "message" in data) return String((data as { message?: unknown }).message);
  if (typeof data === "string" && data.trim()) return data;
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
  headers: { "Content-Type": "application/json" },
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
  if (response.success === false) throw new Error(response.message || "Backend request failed");
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
  if (response.data.success === false) throw new Error(response.data.message || "Backend token request failed");
  return response.data.data.token;
}
