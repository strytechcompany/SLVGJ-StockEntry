import { apiFetch } from "./http";

export function runMonthlyReportNow() {
  return apiFetch("/reports/monthly/run-now", { method: "POST", body: {} });
}
