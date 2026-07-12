import pool from "../../config/db.js";
import * as kRepo from "../konsultasi/konsultasi.repository.js";
import * as kunjunganRepo from "../kunjungan/kunjungan.repository.js";
import * as produkRepo from "../produk/produk.repository.js";

export class ValidationError extends Error {
  constructor(m) { super(m); this.name = "ValidationError"; }
}

// antrian farmasi: kunjungan status FARMASI
export function antrian() {
  return pool
    .query(
      `SELECT k.*, p.nama AS pasien_nama, p.no_rm
       FROM kunjungan k JOIN pasien p ON p.id = k.pasien_id
       WHERE k.status = 'FARMASI' ORDER BY k.id ASC`
    )
    .then((r) => r.rows);
}

// detail resep utk satu kunjungan + ringkasan biaya
export async function detail(kunjunganId) {
  const kunjungan = await kunjunganRepo.findById(kunjunganId);
  if (!kunjungan) throw new ValidationError("Kunjungan tidak ditemukan");
  const konsultasi = await kRepo.findByKunjungan(kunjunganId);
  const items = konsultasi ? await kRepo.findItems(konsultasi.id) : [];
  const biayaKonsul = konsultasi ? Number(konsultasi.biaya_konsul) : 0;
  const totalObat = items.reduce((s, it) => s + Number(it.subtotal), 0);
  return { kunjungan, konsultasi, items, ringkasan: { biaya_konsul: biayaKonsul, total_produk: totalObat, total: biayaKonsul + totalObat } };
}

// dispense satu item: potong stok (kecuali TINDAKAN) + set DISPENSED
export async function dispense(itemId) {
  const item = await kRepo.findItemById(itemId);
  if (!item) throw new ValidationError("Item resep tidak ditemukan");
  if (item.status === "DISPENSED") throw new ValidationError("Item sudah dispensed");

  const produk = await produkRepo.findById(item.produk_id);
  if (!produk) throw new ValidationError("Produk tidak ditemukan");

  // TINDAKAN tidak punya stok → langsung dispensed
  if (produk.kategori !== "TINDAKAN") {
    const updated = await produkRepo.kurangiStok(item.produk_id, Number(item.qty));
    if (!updated) throw new ValidationError(`Stok ${produk.nama} tidak cukup (tersedia ${produk.stok})`);
  }
  return kRepo.setItemDispensed(itemId);
}

// selesaikan farmasi: semua item harus sudah DISPENSED → kunjungan SELESAI
export async function selesai(kunjunganId) {
  const d = await detail(kunjunganId);
  if (d.kunjungan.status !== "FARMASI") throw new ValidationError(`Status kunjungan ${d.kunjungan.status}, bukan FARMASI`);
  const belum = d.items.filter((it) => it.status !== "DISPENSED");
  if (belum.length > 0) throw new ValidationError(`Masih ada ${belum.length} item belum di-dispense`);
  await kunjunganRepo.setStatus(kunjunganId, "SELESAI");
  return { status: "SELESAI" };
}
