import { apiFetch } from "./http";

export function requestLogin(staffName) {
  return apiFetch("/auth/login/request", { method: "POST", body: { staffName } });
}

export function verifyLogin(pendingId, code) {
  return apiFetch("/auth/login/verify", {
    method: "POST",
    body: { pending_id: pendingId, code },
  });
}

export function logout() {
  return apiFetch("/auth/logout", { method: "POST", body: {} });
}
