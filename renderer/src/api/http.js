// Tiny fetch wrapper with token injection.
//
// The auth token is held in localStorage under "se_token". The AuthContext
// is the canonical source, but localStorage gives us a simple sync read
// from inside the fetch helper without dragging React state through every
// API call. Whenever AuthContext mutates, it must update localStorage too.
const API_BASE_URL = "http://localhost:3001";

const TOKEN_KEY = "se_token";

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
}
export function setToken(token) {
  try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

// Hook a logout-on-401 callback. AuthContext registers itself here so a 401
// from any endpoint kicks the user back to the Login screen.
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) { onUnauthorized = fn; }

export async function apiFetch(path, { method = "GET", body, headers, signal, raw = false } = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body != null && !raw ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body != null ? (raw ? body : JSON.stringify(body)) : undefined,
    signal,
  });

  if (res.status === 401) {
    setToken("");
    if (onUnauthorized) onUnauthorized();
    throw new Error("unauthorized");
  }

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message = data?.error || data?.reason || `Request failed (${res.status})`;
    const details = data?.details ? `\n${data.details}` : "";
    const err = new Error(`${message}${details}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Trigger a binary download (used by xlsx export).
export async function apiDownload(path, filename) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safeJsonParse(text) {
  try { return JSON.parse(text); } catch { return { raw: text }; }
}
