import pool from "../../config/db.js";

export function findAll({ q, kategori } = {}) {
  const where = ["aktif = true"];
  const params = [];
  if (kategori) { params.push(kategori); where.push(`kategori = $${params.length}`); }
  if (q) { params.push(`%${q}%`); where.push(`(nama ILIKE $${params.length} OR kode ILIKE $${params.length})`); }
  return pool.query(`SELECT * FROM produk WHERE ${where.join(" AND ")} ORDER BY kategori, nama`, params).then((r) => r.rows);
}

export function findById(id) {
  return pool.query("SELECT * FROM produk WHERE id = $1", [id]).then((r) => r.rows[0]);
}

export function insert(d) {
  return pool
    .query(
      `INSERT INTO produk (kode, nama, kategori, satuan, harga, stok, stok_min)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [d.kode, d.nama, d.kategori, d.satuan || "PCS", d.harga || 0, d.stok || 0, d.stok_min || 0]
    )
    .then((r) => r.rows[0]);
}

export function update(id, d) {
  return pool
    .query(
      `UPDATE produk SET nama=$2, kategori=$3, satuan=$4, harga=$5, stok=$6, stok_min=$7 WHERE id=$1 RETURNING *`,
      [id, d.nama, d.kategori, d.satuan || "PCS", d.harga || 0, d.stok || 0, d.stok_min || 0]
    )
    .then((r) => r.rows[0]);
}

// kurangi stok (dispense) — aman dari minus
export function kurangiStok(id, qty) {
  return pool
    .query(
      `UPDATE produk SET stok = stok - $2 WHERE id = $1 AND stok >= $2 RETURNING *`,
      [id, qty]
    )
    .then((r) => r.rows[0]);
}
