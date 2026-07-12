import pool from "../../config/db.js";

export function findAll(q = "") {
  if (q) {
    const like = `%${q}%`;
    return pool
      .query(
        `SELECT * FROM pasien WHERE nama ILIKE $1 OR no_rm ILIKE $1 OR no_hp ILIKE $1 ORDER BY id DESC`,
        [like]
      )
      .then((r) => r.rows);
  }
  return pool.query("SELECT * FROM pasien ORDER BY id DESC").then((r) => r.rows);
}

export function findById(id) {
  return pool.query("SELECT * FROM pasien WHERE id = $1", [id]).then((r) => r.rows[0]);
}

export function countAll() {
  return pool.query("SELECT COUNT(*)::int AS n FROM pasien").then((r) => r.rows[0].n);
}

export function insert(d) {
  return pool
    .query(
      `INSERT INTO pasien (no_rm, nama, no_hp, jenis_kelamin, tgl_lahir, alamat, jenis_kulit, alergi)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [d.no_rm, d.nama, d.no_hp || null, d.jenis_kelamin || null, d.tgl_lahir || null, d.alamat || null, d.jenis_kulit || null, d.alergi || null]
    )
    .then((r) => r.rows[0]);
}

export function update(id, d) {
  return pool
    .query(
      `UPDATE pasien SET nama=$2, no_hp=$3, jenis_kelamin=$4, tgl_lahir=$5, alamat=$6, jenis_kulit=$7, alergi=$8
       WHERE id=$1 RETURNING *`,
      [id, d.nama, d.no_hp || null, d.jenis_kelamin || null, d.tgl_lahir || null, d.alamat || null, d.jenis_kulit || null, d.alergi || null]
    )
    .then((r) => r.rows[0]);
}
