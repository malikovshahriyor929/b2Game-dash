export type RigRecord = {
  rig_id: string;
  simulator_id?: string;
  branch_id?: string;
  branch_name?: string;
  branch_code?: string;
  hostname: string;
  label: string;
  code?: string;
  zone?: string;
  simulator_type?: string;
  version: string;
  latest_version: string;
  needs_update: boolean;
  online: boolean;
  locked: boolean;
  unlock_until: string | null;
  state: "Available" | "In use" | "Updating" | "Offline" | string;
  update_status: string;
  current_session_id?: string | null;
  active_session_id?: string | null;
  active_customer_name?: string | null;
  active_phone?: string | null;
  active_started_at?: string | null;
  active_remaining_seconds?: number | string | null;
  active_paid_amount?: number | string | null;
  active_payment_mode?: string | null;
  active_tariff_name?: string | null;
  first_seen: string | null;
  last_seen: string | null;
};

export function mapBackendSimulatorRows(rows: Array<Record<string, any>>): RigRecord[] {
  return rows.map((item) => ({
    rig_id: item.ws_rig_id ?? item.device_id ?? item.id,
    simulator_id: item.id,
    branch_id: item.branch_id,
    branch_name: item.branch_name,
    branch_code: item.branch_code,
    hostname: item.ip_address ?? item.device_id ?? item.code,
    label: item.name,
    code: item.code,
    zone: item.zone,
    simulator_type: item.simulator_type,
    version: item.rig_version ?? "unknown",
    latest_version: item.latest_version ?? "unknown",
    needs_update: Boolean(item.latest_version && item.rig_version && item.latest_version !== item.rig_version),
    online: Boolean(item.is_online || item.status !== "offline"),
    locked: item.locked ?? (item.status === "locked" || item.status === "ready_to_play"),
    unlock_until: item.unlock_until ?? null,
    state: item.status,
    update_status: item.update_status ?? "",
    current_session_id: item.current_session_id ?? null,
    active_session_id: item.active_session_id ?? null,
    active_customer_name: item.active_customer_name ?? null,
    active_phone: item.active_phone ?? null,
    active_started_at: item.active_started_at ?? null,
    active_remaining_seconds: item.active_remaining_seconds ?? null,
    active_paid_amount: item.active_paid_amount ?? null,
    active_payment_mode: item.active_payment_mode ?? null,
    active_tariff_name: item.active_tariff_name ?? null,
    first_seen: item.first_seen ?? null,
    last_seen: item.last_seen_at ?? item.last_seen ?? null,
  }));
}

async function requestRigAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/backend${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Rig admin request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function listRigs() {
  return requestRigAdmin<{ success: boolean; data: Array<Record<string, any>> }>("/simulators/map").then((response) =>
    mapBackendSimulatorRows(response.data),
  );
}

export function getLatestRigVersion() {
  return Promise.resolve({ latest_version: "backend" });
}

export function notifyRig(rigId: string, message: string) {
  return requestRigAdmin<{ success: true }>(`/simulators/${encodeURIComponent(rigId)}/notify`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function lockRig(rigId: string, message = "LOCKED - see staff") {
  return requestRigAdmin<{ success: true }>(`/simulators/${encodeURIComponent(rigId)}/lock`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function unlockRig(rigId: string, minutes?: number) {
  return requestRigAdmin<{ success: true; data: unknown }>(`/simulators/${encodeURIComponent(rigId)}/${minutes && minutes > 0 ? "timed-unlock" : "unlock"}`, {
    method: "POST",
    body: JSON.stringify(minutes && minutes > 0 ? { minutes } : {}),
  });
}

export function pushRigUpdate(rigIds: string[]) {
  return requestRigAdmin<{ success: true; data: unknown }>("/simulators/push-update", {
    method: "POST",
    body: JSON.stringify({ simulator_ids: rigIds }),
  });
}

export function removeRig(rigId: string) {
  return requestRigAdmin<{ success: true }>(`/simulators/${encodeURIComponent(rigId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "offline" }),
  });
}
