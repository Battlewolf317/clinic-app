import { apiFetch } from "../../lib/api";
import type { Produk } from "../../lib/types";

export const getProduk = (q = "", kategori = "") => {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (kategori) p.set("kategori", kategori);
  const qs = p.toString();
  return apiFetch<Produk[]>(`/produk${qs ? `?${qs}` : ""}`);
};
export const createProduk = (d: Partial<Produk>) => apiFetch<Produk>("/produk", { method: "POST", body: JSON.stringify(d) });
export const updateProduk = (id: number, d: Partial<Produk>) => apiFetch<Produk>(`/produk/${id}`, { method: "PUT", body: JSON.stringify(d) });
