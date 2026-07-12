import { apiFetch } from "../../lib/api";
import type { Pasien, Kunjungan } from "../../lib/types";

export const getPasien = (q = "") => apiFetch<Pasien[]>(`/pasien${q ? `?q=${encodeURIComponent(q)}` : ""}`);
export const createPasien = (d: Partial<Pasien>) => apiFetch<Pasien>("/pasien", { method: "POST", body: JSON.stringify(d) });
export const updatePasien = (id: number, d: Partial<Pasien>) => apiFetch<Pasien>(`/pasien/${id}`, { method: "PUT", body: JSON.stringify(d) });

export const getKunjungan = (status = "", q = "") => {
  const p = new URLSearchParams();
  if (status) p.set("status", status);
  if (q) p.set("q", q);
  const qs = p.toString();
  return apiFetch<Kunjungan[]>(`/kunjungan${qs ? `?${qs}` : ""}`);
};
export const createKunjungan = (d: { pasien_id: number; jenis: string; keluhan: string }) =>
  apiFetch<Kunjungan>("/kunjungan", { method: "POST", body: JSON.stringify(d) });
