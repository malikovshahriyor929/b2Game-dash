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

function rigMvpUrl(path: string) {
  return new URL(path, env.RIG_MVP_API_URL).toString();
}

async function rigMvpRequest<T>(path: string, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(rigMvpUrl(path), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (error) {
    throw new ApiError(503, `Rig-MVP server is not reachable at ${env.RIG_MVP_API_URL}: ${String(error)}`);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(response.status, message || `Rig-MVP request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
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

async function rigMvpAction<T>(path: string, init?: RequestInit) {
  const result = await rigMvpRequest<T>(path, init);
  await triggerRigMvpSync({ forcePersist: true });
  return result;
}

export function notifyRigMvp(rigId: string, message: string) {
  return rigMvpAction<{ ok: boolean }>(`/api/rigs/${encodeURIComponent(rigId)}/notify`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function lockRigMvp(rigId: string, message: string) {
  return rigMvpAction<{ ok: boolean }>(`/api/rigs/${encodeURIComponent(rigId)}/lock`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function unlockRigMvp(rigId: string, minutes?: number) {
  return rigMvpAction<{ ok: boolean; unlock_until: string | null }>(`/api/rigs/${encodeURIComponent(rigId)}/unlock`, {
    method: "POST",
    body: JSON.stringify(minutes && minutes > 0 ? { minutes } : {}),
  });
}

export function sendRigMvpCommand(rigId: string, payload: Record<string, unknown>) {
  return rigMvpAction<{ ok: boolean }>(`/api/rigs/${encodeURIComponent(rigId)}/command`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function pushRigMvpUpdate(rigIds: string[]) {
  return rigMvpRequest<{ version: string; results: Array<{ rig_id: string; ok: boolean; error?: string }> }>("/api/rigs/push_update", {
    method: "POST",
    body: JSON.stringify({ rig_ids: rigIds }),
  });
}

export function removeRigMvp(rigId: string) {
  return rigMvpAction<{ ok: boolean }>(`/api/rigs/${encodeURIComponent(rigId)}/remove`, { method: "POST" });
}
