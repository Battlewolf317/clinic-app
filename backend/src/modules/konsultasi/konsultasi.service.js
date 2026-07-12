import * as repo from "./konsultasi.repository.js";
import * as kunjunganRepo from "../kunjungan/kunjungan.repository.js";
import * as produkRepo from "../produk/produk.repository.js";

export class ValidationError extends Error {
  constructor(m) { super(m); this.name = "ValidationError"; }
}

// ambil konsultasi by kunjungan (auto-create kalau belum ada) + items
export async function getByKunjungan(kunjunganId) {
  const kunjungan = await kunjunganRepo.findById(kunjunganId);
  if (!kunjungan) throw new ValidationError("Kunjungan tidak ditemukan");
  let k = await repo.findByKunjungan(kunjunganId);
  if (!k) k = await repo.insert(kunjunganId, {});
  const items = await repo.findItems(k.id);
  return { kunjungan, konsultasi: k, items };
}

// simpan/update field konsultasi
export async function save(kunjunganId, d) {
  const kunjungan = await kunjunganRepo.findById(kunjunganId);
  if (!kunjungan) throw new ValidationError("Kunjungan tidak ditemukan");
  if (kunjungan.status === "SELESAI" || kunjungan.status === "BATAL")
    throw new ValidationError(`Kunjungan sudah ${kunjungan.status}, tidak bisa diubah`);

  let k = await repo.findByKunjungan(kunjunganId);
  if (!k) k = await repo.insert(kunjunganId, d);
  else k = await repo.update(k.id, d);

  // begitu dokter mulai isi → status kunjungan jadi KONSULTASI
  if (kunjungan.status === "DAFTAR") await kunjunganRepo.setStatus(kunjunganId, "KONSULTASI");

  const items = await repo.findItems(k.id);
  return { konsultasi: k, items };
}

// tambah item resep
export async function addResepItem(konsultasiId, d) {
  const k = await repo.findById(konsultasiId);
  if (!k) throw new ValidationError("Konsultasi tidak ditemukan");
  const produkId = Number(d.produk_id) || 0;
  if (!produkId) throw new ValidationError("Produk wajib dipilih");
  const produk = await produkRepo.findById(produkId);
  if (!produk) throw new ValidationError("Produk tidak ditemukan");
  const qty = Number(d.qty) || 0;
  if (qty <= 0) throw new ValidationError("Qty harus lebih dari 0");

  const harga = Number(produk.harga);
  const subtotal = harga * qty;
  await repo.insertItem(konsultasiId, { produk_id: produkId, qty, aturan_pakai: d.aturan_pakai, harga, subtotal });
  return repo.findItems(konsultasiId);
}

export async function removeResepItem(itemId) {
  const item = await repo.findItemById(itemId);
  if (!item) throw new ValidationError("Item resep tidak ditemukan");
  if (item.status === "DISPENSED") throw new ValidationError("Item sudah dispensed, tidak bisa dihapus");
  await repo.deleteItem(itemId);
  return repo.findItems(item.konsultasi_id);
}

// selesaikan konsultasi → kalau ada resep, lanjut FARMASI; kalau tidak, SELESAI
export async function selesai(kunjunganId) {
  const data = await getByKunjungan(kunjunganId);
  if (!data.konsultasi.diagnosa) throw new ValidationError("Diagnosa wajib diisi sebelum menyelesaikan konsultasi");
  const next = data.items.length > 0 ? "FARMASI" : "SELESAI";
  await kunjunganRepo.setStatus(kunjunganId, next);
  return { status: next };
}

export { repo };
