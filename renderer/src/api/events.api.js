import { apiFetch } from "./http";

export function recentSales(since = 0, { signal } = {}) {
  return apiFetch(`/events/recent-sales?since=${encodeURIComponent(since)}`, { signal });
}
