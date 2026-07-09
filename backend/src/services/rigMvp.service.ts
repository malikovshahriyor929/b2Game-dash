import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { env } from "../config/env";
import { triggerRigMvpSync } from "./rigMvpSync.service";
import { ApiError } from "../utils/apiError";

export type RigMvpRig = {
  rig_id: string;
  hostname: string;
  label: string;
  version: string;
  latest_version: string;
  needs_update: boolean;
  online: boolean;
  locked: boolean;
  unlock_until: string | null;
  state: "Available" | "In use" | "Updating" | "Offline" | string;
  update_status: string;
  first_seen: string | null;
  last_seen: string | null;
};

const rigMvpAxios = axios.create({
  baseURL: env.RIG_MVP_API_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    // Server-to-server auth for admin_server's gated /api/* — must match
    // its RIG_MVP_API_KEY. Only sent when a key is configured, so an
    // unprotected dev server still works.
    ...(env.RIG_MVP_API_KEY ? { "X-API-Key": env.RIG_MVP_API_KEY } : {}),
  },
  validateStatus: () => true,
});

function rigMvpErrorMessage(data: unknown) {
  if (typeof data === "string" && data.trim()) {
    const trimmed = data.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const payload = parsed as { message?: unknown; detail?: unknown; error?: unknown };
          const nested = payload.message ?? payload.detail ?? payload.error;
          if (typeof nested === "string" && nested.trim()) return rigMvpErrorMessage(nested);
        }
      } catch {
        // Fall through to HTML/plain text cleanup.
      }
    }
    const ngrokOffline = trimmed.match(/endpoint\s+([a-z0-9-]+\.ngrok-free\.dev)\s+is\s+offline/i);
    if (trimmed.includes("ERR_NGROK_3200") || ngrokOffline) {
      return ngrokOffline
        ? `Ngrok endpoint offline: ${ngrokOffline[1]}. Rig-MVP serverni qayta ishga tushiring yoki RIG_MVP_API_URL ni yangilang.`
        : "Ngrok endpoint offline. Rig-MVP serverni qayta ishga tushiring yoki RIG_MVP_API_URL ni yangilang.";
    }
    if (/^<!doctype html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
      const title = trimmed.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim();
      return title ? `Rig-MVP HTML error qaytardi: ${title}` : "Rig-MVP JSON o'rniga HTML error qaytardi.";
    }
    return trimmed;
  }
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "";
}

async function rigMvpRequest<T>(path: string, config?: AxiosRequestConfig) {
  try {
    const response = await rigMvpAxios.request<T>({ ...config, url: path });
    if (response.status < 200 || response.status >= 300) {
      const message = rigMvpErrorMessage(response.data);
      throw new ApiError(response.status, message || `Rig-MVP request failed: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isAxiosError(error)) {
      throw new ApiError(503, `Rig-MVP server is not reachable at ${env.RIG_MVP_API_URL}: ${error.message}`);
    }
    throw new ApiError(503, `Rig-MVP server is not reachable at ${env.RIG_MVP_API_URL}: ${String(error)}`);
  }
}

export async function listRigMvpRigs() {
  return rigMvpRequest<RigMvpRig[]>("/api/rigs");
}

export async function getRigMvpRig(rigId: string) {
  const rigs = await listRigMvpRigs();
  const rig = rigs.find((item) => item.rig_id === rigId);
  if (!rig) throw new ApiError(404, `Rig '${rigId}' not found in Rig-MVP`);
  return rig;
}

async function rigMvpAction<T>(path: string, config?: AxiosRequestConfig) {
  const result = await rigMvpRequest<T>(path, config);
  await triggerRigMvpSync({ forcePersist: true });
  return result;
}

export function notifyRigMvp(rigId: string, message: string) {
  return rigMvpAction<{ ok: boolean }>(`/api/rigs/${encodeURIComponent(rigId)}/notify`, {
    method: "POST",
    data: { message },
  });
}

export function lockRigMvp(rigId: string, message: string) {
  return rigMvpAction<{ ok: boolean }>(`/api/rigs/${encodeURIComponent(rigId)}/lock`, {
    method: "POST",
    data: { message },
  });
}

export function unlockRigMvp(rigId: string, minutes?: number) {
  return rigMvpAction<{ ok: boolean; unlock_until: string | null }>(`/api/rigs/${encodeURIComponent(rigId)}/unlock`, {
    method: "POST",
    data: minutes && minutes > 0 ? { minutes } : {},
  });
}

export function availableRigMvp(rigId: string) {
  return rigMvpAction<{ ok: boolean }>(`/api/rigs/${encodeURIComponent(rigId)}/available`, {
    method: "POST",
    data: {},
  });
}

export function sendRigMvpCommand(rigId: string, payload: Record<string, unknown>) {
  return rigMvpAction<{ ok: boolean }>(`/api/rigs/${encodeURIComponent(rigId)}/command`, {
    method: "POST",
    data: payload,
  });
}

export function pushRigMvpUpdate(rigIds: string[]) {
  return rigMvpRequest<{ version: string; results: Array<{ rig_id: string; ok: boolean; error?: string }> }>("/api/rigs/push_update", {
    method: "POST",
    data: { rig_ids: rigIds },
  });
}

export function removeRigMvp(rigId: string) {
  return rigMvpAction<{ ok: boolean }>(`/api/rigs/${encodeURIComponent(rigId)}/remove`, { method: "POST" });
}
