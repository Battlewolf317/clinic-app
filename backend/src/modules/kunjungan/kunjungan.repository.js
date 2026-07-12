import pool from "../../config/db.js";

const SELECT_JOIN = `
  SELECT k.*, p.nama AS pasien_nama, p.no_rm, p.jenis_kelamin, p.jenis_kulit, p.alergi
  FROM kunjungan k JOIN pasien p ON p.id = k.pasien_id`;

export function findAll({ status, q } = {}) {
  const where = [];
  const params = [];
  if (status) { params.push(status); where.push(`k.status = $${params.length}`); }
  if (q) { params.push(`%${q}%`); where.push(`(p.nama ILIKE $${params.length} OR p.no_rm ILIKE $${params.length} OR k.kode ILIKE $${params.length})`); }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return pool.query(`${SELECT_JOIN} ${clause} ORDER BY k.id DESC`, params).then((r) => r.rows);
}

export function findById(id) {
  return pool.query(`${SELECT_JOIN} WHERE k.id = $1`, [id]).then((r) => r.rows[0]);
}

export function countToday() {
  return pool
    .query("SELECT COUNT(*)::int AS n FROM kunjungan WHERE tanggal::date = current_date")
    .then((r) => r.rows[0].n);
}

export function insert(d) {
  return pool
    .query(
      `INSERT INTO kunjungan (kode, pasien_id, jenis, keluhan, status)
       VALUES ($1,$2,$3,$4,'DAFTAR') RETURNING *`,
      [d.kode, d.pasien_id, d.jenis || "KONSULTASI", d.keluhan || null]
    )
    .then((r) => r.rows[0]);
}

export function setStatus(id, status) {
  return pool
    .query("UPDATE kunjungan SET status=$2, updated_at=now() WHERE id=$1 RETURNING *", [id, status])
    .then((r) => r.rows[0]);
}
