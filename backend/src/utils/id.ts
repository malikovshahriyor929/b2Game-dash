import crypto from "crypto";

export function id() {
  return crypto.randomUUID();
}
