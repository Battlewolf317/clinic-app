import { apiFetch } from "../../lib/api";
import type { Kunjungan, Konsultasi, ResepItem } from "../../lib/types";

export type FarmasiDetail = {
  kunjungan: Kunjungan;
  konsultasi: Konsultasi | null;
  items: ResepItem[];
  ringkasan: { biaya_konsul: number; total_produk: number; total: number };
};

export const getAntrian = () => apiFetch<Kunjungan[]>("/farmasi/antrian");
export const getDetail = (kunjunganId: number) => apiFetch<FarmasiDetail>(`/farmasi/by-kunjungan/${kunjunganId}`);
export const dispense = (itemId: number) => apiFetch<ResepItem>(`/farmasi/resep/${itemId}/dispense`, { method: "PATCH" });
export const selesai = (kunjunganId: number) => apiFetch<{ status: string }>(`/farmasi/by-kunjungan/${kunjunganId}/selesai`, { method: "PATCH" });
