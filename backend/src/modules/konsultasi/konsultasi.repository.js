import pool from "../../config/db.js";

export function findByKunjungan(kunjunganId) {
  return pool.query("SELECT * FROM konsultasi WHERE kunjungan_id = $1", [kunjunganId]).then((r) => r.rows[0]);
}

export function findById(id) {
  return pool.query("SELECT * FROM konsultasi WHERE id = $1", [id]).then((r) => r.rows[0]);
}

export function insert(kunjunganId, d) {
  return pool
    .query(
      `INSERT INTO konsultasi (kunjungan_id, dokter, anamnesa, diagnosa, treatment, catatan, biaya_konsul)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [kunjunganId, d.dokter || null, d.anamnesa || null, d.diagnosa || null, d.treatment || null, d.catatan || null, d.biaya_konsul || 0]
    )
    .then((r) => r.rows[0]);
}

export function update(id, d) {
  return pool
    .query(
      `UPDATE konsultasi SET dokter=$2, anamnesa=$3, diagnosa=$4, treatment=$5, catatan=$6, biaya_konsul=$7, updated_at=now()
       WHERE id=$1 RETURNING *`,
      [id, d.dokter || null, d.anamnesa || null, d.diagnosa || null, d.treatment || null, d.catatan || null, d.biaya_konsul || 0]
    )
    .then((r) => r.rows[0]);
}

// --- resep_item ---
export function findItems(konsultasiId) {
  return pool
    .query(
      `SELECT ri.*, p.nama AS produk_nama, p.kode AS produk_kode, p.kategori, p.satuan, p.stok AS stok_tersedia
       FROM resep_item ri JOIN produk p ON p.id = ri.produk_id
       WHERE ri.konsultasi_id = $1 ORDER BY ri.id`,
      [konsultasiId]
    )
    .then((r) => r.rows);
}

export function findItemById(id) {
  return pool.query("SELECT * FROM resep_item WHERE id = $1", [id]).then((r) => r.rows[0]);
}

export function insertItem(konsultasiId, d) {
  return pool
    .query(
      `INSERT INTO resep_item (konsultasi_id, produk_id, qty, aturan_pakai, harga, subtotal, status)
       VALUES ($1,$2,$3,$4,$5,$6,'RESEP') RETURNING *`,
      [konsultasiId, d.produk_id, d.qty, d.aturan_pakai || null, d.harga, d.subtotal]
    )
    .then((r) => r.rows[0]);
}

export function deleteItem(id) {
  return pool.query("DELETE FROM resep_item WHERE id = $1", [id]).then(() => true);
}

export function setItemDispensed(id) {
  return pool.query("UPDATE resep_item SET status='DISPENSED' WHERE id=$1 RETURNING *", [id]).then((r) => r.rows[0]);
}
