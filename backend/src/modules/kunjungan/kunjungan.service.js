import * as repo from "./kunjungan.repository.js";
import * as pasienRepo from "../pasien/pasien.repository.js";

export class ValidationError extends Error {
  constructor(m) { super(m); this.name = "ValidationError"; }
}

const JENIS_VALID = ["KONSULTASI", "TREATMENT", "KONTROL"];

export function list(filter) {
  return repo.findAll(filter);
}

export async function getById(id) {
  const k = await repo.findById(id);
  if (!k) throw new ValidationError("Kunjungan tidak ditemukan");
  return k;
}

async function genKode() {
  const n = await repo.countToday();
  const d = new Date();
  const tgl = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `KJ${tgl}${String(n + 1).padStart(3, "0")}`;
}

export async function create(d) {
  const pasienId = Number(d.pasien_id) || 0;
  if (!pasienId) throw new ValidationError("Pasien wajib dipilih");
  const pasien = await pasienRepo.findById(pasienId);
  if (!pasien) throw new ValidationError("Pasien tidak ditemukan");
  if (d.jenis && !JENIS_VALID.includes(d.jenis)) throw new ValidationError("Jenis kunjungan tidak valid");
  const kode = await genKode();
  return repo.insert({ kode, pasien_id: pasienId, jenis: d.jenis, keluhan: d.keluhan });
}

// alur status: DAFTAR -> KONSULTASI -> FARMASI -> SELESAI (atau BATAL)
const FLOW = { DAFTAR: ["KONSULTASI", "BATAL"], KONSULTASI: ["FARMASI", "SELESAI", "BATAL"], FARMASI: ["SELESAI"], SELESAI: [], BATAL: [] };

export async function setStatus(id, status) {
  const k = await getById(id);
  const allowed = FLOW[k.status] || [];
  if (!allowed.includes(status)) {
    throw new ValidationError(`Tidak bisa ubah status dari ${k.status} ke ${status}`);
  }
  return repo.setStatus(id, status);
}
