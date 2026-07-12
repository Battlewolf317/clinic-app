// =====================================================================
// config/db.js — koneksi PostgreSQL + bikin tabel + seed (Klinik Kulit)
// =====================================================================

import "dotenv/config";
import pkg from "pg";
import bcrypt from "bcryptjs";
const { Pool } = pkg;

// Pakai DATABASE_URL (managed Postgres / Neon) jika ada, else koneksi lokal via PG* env.
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : undefined
);

export async function initDb() {
  // ------------------------------------------------------------------
  // pasien
  // ------------------------------------------------------------------
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pasien (
      id            SERIAL PRIMARY KEY,
      no_rm         VARCHAR(20) UNIQUE NOT NULL,
      nama          VARCHAR(120) NOT NULL,
      no_hp         VARCHAR(20),
      jenis_kelamin CHAR(1),                       -- L / P
      tgl_lahir     DATE,
      alamat        TEXT,
      jenis_kulit   VARCHAR(20),                   -- NORMAL/KERING/BERMINYAK/KOMBINASI/SENSITIF
      alergi        VARCHAR(200),
      created_at    TIMESTAMP DEFAULT now()
    )
  `);

  // ------------------------------------------------------------------
  // kunjungan (pendaftaran)
  // ------------------------------------------------------------------
  await pool.query(`
    CREATE TABLE IF NOT EXISTS kunjungan (
      id          SERIAL PRIMARY KEY,
      kode        VARCHAR(20) UNIQUE NOT NULL,
      pasien_id   INT NOT NULL REFERENCES pasien(id),
      tanggal     TIMESTAMP DEFAULT now(),
      jenis       VARCHAR(15) NOT NULL DEFAULT 'KONSULTASI', -- KONSULTASI/TREATMENT/KONTROL
      keluhan     TEXT,
      status      VARCHAR(12) NOT NULL DEFAULT 'DAFTAR',     -- DAFTAR/KONSULTASI/FARMASI/SELESAI/BATAL
      created_at  TIMESTAMP DEFAULT now(),
      updated_at  TIMESTAMP DEFAULT now()
    )
  `);

  // ------------------------------------------------------------------
  // konsultasi (1:1 dengan kunjungan)
  // ------------------------------------------------------------------
  await pool.query(`
    CREATE TABLE IF NOT EXISTS konsultasi (
      id            SERIAL PRIMARY KEY,
      kunjungan_id  INT NOT NULL UNIQUE REFERENCES kunjungan(id),
      dokter        VARCHAR(120),
      anamnesa      TEXT,                 -- keluhan/riwayat
      diagnosa      TEXT,                 -- diagnosa dokter
      treatment     TEXT,                 -- tindakan/treatment yg dilakukan
      catatan       TEXT,
      biaya_konsul  NUMERIC(14,2) DEFAULT 0,
      created_at    TIMESTAMP DEFAULT now(),
      updated_at    TIMESTAMP DEFAULT now()
    )
  `);

  // ------------------------------------------------------------------
  // produk (obat / skincare / tindakan) + stok
  // ------------------------------------------------------------------
  await pool.query(`
    CREATE TABLE IF NOT EXISTS produk (
      id         SERIAL PRIMARY KEY,
      kode       VARCHAR(20) UNIQUE NOT NULL,
      nama       VARCHAR(150) NOT NULL,
      kategori   VARCHAR(15) NOT NULL DEFAULT 'SKINCARE', -- OBAT/SKINCARE/TINDAKAN
      satuan     VARCHAR(10) DEFAULT 'PCS',
      harga      NUMERIC(14,2) NOT NULL DEFAULT 0,
      stok       NUMERIC(14,2) NOT NULL DEFAULT 0,        -- TINDAKAN: stok diabaikan
      stok_min   NUMERIC(14,2) NOT NULL DEFAULT 0,
      aktif      BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT now()
    )
  `);

  // ------------------------------------------------------------------
  // resep_item (produk diresepkan per konsultasi) — dispensing oleh farmasi
  // ------------------------------------------------------------------
  await pool.query(`
    CREATE TABLE IF NOT EXISTS resep_item (
      id            SERIAL PRIMARY KEY,
      konsultasi_id INT NOT NULL REFERENCES konsultasi(id),
      produk_id     INT NOT NULL REFERENCES produk(id),
      qty           NUMERIC(14,2) NOT NULL DEFAULT 1,
      aturan_pakai  VARCHAR(200),
      harga         NUMERIC(14,2) NOT NULL DEFAULT 0,
      subtotal      NUMERIC(14,2) NOT NULL DEFAULT 0,
      status        VARCHAR(12) NOT NULL DEFAULT 'RESEP', -- RESEP / DISPENSED
      created_at    TIMESTAMP DEFAULT now()
    )
  `);

  // ------------------------------------------------------------------
  // app_user (login + role)
  // ------------------------------------------------------------------
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_user (
      id            SERIAL PRIMARY KEY,
      username      VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(100) NOT NULL,
      nama          VARCHAR(100),
      role          VARCHAR(20) NOT NULL DEFAULT 'resepsionis', -- admin/resepsionis/dokter/farmasi
      active        BOOLEAN DEFAULT true,
      created_at    TIMESTAMP DEFAULT now()
    )
  `);

  // ---------------------- SEED ----------------------
  const pr = await pool.query("SELECT COUNT(*)::int AS n FROM produk");
  if (pr.rows[0].n === 0) {
    await pool.query(`INSERT INTO produk (kode, nama, kategori, satuan, harga, stok, stok_min) VALUES
      ('SKN001','Serum Vitamin C 20ml','SKINCARE','BTL',185000,40,10),
      ('SKN002','Sunscreen SPF 50 PA+++ 50ml','SKINCARE','TUBE',145000,60,15),
      ('SKN003','Retinol 0.5% Serum 30ml','SKINCARE','BTL',225000,25,10),
      ('SKN004','Niacinamide 10% 30ml','SKINCARE','BTL',135000,35,10),
      ('SKN005','Gentle Cleanser 100ml','SKINCARE','BTL',95000,50,15),
      ('SKN006','Moisturizer Ceramide 50ml','SKINCARE','JAR',165000,30,10),
      ('OBT001','Antibiotik Topikal (Clindamycin) 15g','OBAT','TUBE',75000,40,10),
      ('OBT002','Tretinoin 0.025% Cream 20g','OBAT','TUBE',120000,20,8),
      ('OBT003','Asam Salisilat 2% Solution 60ml','OBAT','BTL',85000,30,10),
      ('OBT004','Antihistamin (Cetirizine) Tablet','OBAT','TAB',2500,500,100),
      ('TND001','Facial Treatment Basic','TINDAKAN','SESI',250000,0,0),
      ('TND002','Chemical Peeling','TINDAKAN','SESI',450000,0,0),
      ('TND003','Mikrodermabrasi','TINDAKAN','SESI',400000,0,0),
      ('TND004','Laser Rejuvenation','TINDAKAN','SESI',850000,0,0),
      ('TND005','Ekstraksi Komedo','TINDAKAN','SESI',150000,0,0)`);
    console.log("📦 Data produk (skincare/obat/tindakan) dibuat (seed)");
  }

  const ps = await pool.query("SELECT COUNT(*)::int AS n FROM pasien");
  if (ps.rows[0].n === 0) {
    await pool.query(
      `INSERT INTO pasien (no_rm, nama, no_hp, jenis_kelamin, tgl_lahir, alamat, jenis_kulit, alergi) VALUES
       ('RM0001','SARI DEWI','081234567890','P','1995-04-12','Jl. Kenanga No. 5, Jakarta','KOMBINASI','Tidak ada'),
       ('RM0002','RANGGA PUTRA','081298765432','L','1990-09-20','Jl. Melati No. 8, Jakarta','BERMINYAK','Penisilin')`
    );
    console.log("📦 Data contoh pasien dibuat (seed)");
  }

  const seed = [
    ["admin", "admin123", "Administrator", "admin"],
    ["resepsionis", "resepsionis123", "RESEPSIONIS 1", "resepsionis"],
    ["dokter", "dokter123", "dr. AYU SpKK", "dokter"],
    ["farmasi", "farmasi123", "APOTEKER", "farmasi"],
  ];
  for (const [username, pass, nama, role] of seed) {
    const hash = await bcrypt.hash(pass, 10);
    await pool.query(
      `INSERT INTO app_user (username, password_hash, nama, role)
       VALUES ($1,$2,$3,$4) ON CONFLICT (username) DO NOTHING`,
      [username, hash, nama, role]
    );
  }
  console.log("📦 User seed dicek (admin/resepsionis/dokter/farmasi — password: <user>123)");
}

export default pool;
