import { apiFetch, apiDownload } from "./http";

export function listProducts({ status = "in_stock", signal } = {}) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch(`/products${qs}`, { signal });
}

export function getProductById(id, { signal } = {}) {
  return apiFetch(`/products/${encodeURIComponent(id)}`, { signal });
}

export function getProductByBarcode(barcode, { signal } = {}) {
  return apiFetch(`/products/by-barcode/${encodeURIComponent(barcode)}`, { signal });
}

export function createProduct(payload) {
  return apiFetch("/products", { method: "POST", body: payload });
}

export function requestEdit(productId, payload, staffName) {
  return apiFetch(`/products/${encodeURIComponent(productId)}/edit/request`, {
    method: "POST",
    body: { ...payload, staffName: staffName || "Staff" },
  });
}

export function confirmEdit(productId, pendingId, code) {
  return apiFetch(`/products/${encodeURIComponent(productId)}/edit/confirm`, {
    method: "POST",
    body: { pending_id: pendingId, code },
  });
}

export function requestDelete(productId, staffName) {
  return apiFetch(`/products/${encodeURIComponent(productId)}/delete/request`, {
    method: "POST",
    body: { staffName: staffName || "Staff" },
  });
}

export function confirmDelete(productId, pendingId, code) {
  return apiFetch(`/products/${encodeURIComponent(productId)}/delete/confirm`, {
    method: "POST",
    body: { pending_id: pendingId, code },
  });
}

export function getDashboardStats({ signal } = {}) {
  return apiFetch("/products/stats", { signal });
}

export function listPendingActions({ signal } = {}) {
  return apiFetch("/products/pending", { signal });
}

export function exportXLSX() {
  return apiDownload("/products/export/xlsx", `inventory_${Date.now()}.xlsx`);
}

export function exportCSV() {
  return apiDownload("/products/export/csv", `inventory_${Date.now()}.csv`);
}
