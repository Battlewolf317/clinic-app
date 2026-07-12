import { apiFetch } from "../../lib/api";
import type { Kunjungan, Konsultasi, ResepItem, Produk } from "../../lib/types";

export const getAntrian = () =>
  apiFetch<Kunjungan[]>("/kunjungan").then((rows) =>
    rows.filter((k) => k.status === "DAFTAR" || k.status === "KONSULTASI")
  );

export const getDetail = (kunjunganId: number) =>
  apiFetch<{ kunjungan: Kunjungan; konsultasi: Konsultasi; items: ResepItem[] }>(`/konsultasi/by-kunjungan/${kunjunganId}`);

export const saveKonsultasi = (kunjunganId: number, d: Partial<Konsultasi>) =>
  apiFetch<{ konsultasi: Konsultasi; items: ResepItem[] }>(`/konsultasi/by-kunjungan/${kunjunganId}`, { method: "POST", body: JSON.stringify(d) });

export const addResep = (konsultasiId: number, d: { produk_id: number; qty: number; aturan_pakai: string }) =>
  apiFetch<ResepItem[]>(`/konsultasi/${konsultasiId}/resep`, { method: "POST", body: JSON.stringify(d) });

export const removeResep = (itemId: number) =>
  apiFetch<ResepItem[]>(`/konsultasi/resep/${itemId}`, { method: "DELETE" });

export const selesaiKonsultasi = (kunjunganId: number) =>
  apiFetch<{ status: string }>(`/konsultasi/by-kunjungan/${kunjunganId}/selesai`, { method: "PATCH" });

export const getProduk = () => apiFetch<Produk[]>("/produk");
