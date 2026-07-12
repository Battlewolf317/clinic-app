// Tipe data (NUMERIC dari PostgreSQL datang sebagai string)

export type Pasien = {
  id: number;
  no_rm: string;
  nama: string;
  no_hp: string | null;
  jenis_kelamin: string | null;
  tgl_lahir: string | null;
  alamat: string | null;
  jenis_kulit: string | null;
  alergi: string | null;
};

export type Kunjungan = {
  id: number;
  kode: string;
  pasien_id: number;
  tanggal: string;
  jenis: string;
  keluhan: string | null;
  status: string;
  pasien_nama: string;
  no_rm: string;
  jenis_kelamin: string | null;
  jenis_kulit: string | null;
  alergi: string | null;
};

export type Konsultasi = {
  id: number;
  kunjungan_id: number;
  dokter: string | null;
  anamnesa: string | null;
  diagnosa: string | null;
  treatment: string | null;
  catatan: string | null;
  biaya_konsul: string;
};

export type ResepItem = {
  id: number;
  konsultasi_id: number;
  produk_id: number;
  qty: string;
  aturan_pakai: string | null;
  harga: string;
  subtotal: string;
  status: string;
  produk_nama: string;
  produk_kode: string;
  kategori: string;
  satuan: string;
  stok_tersedia: string;
};

export type Produk = {
  id: number;
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  harga: string;
  stok: string;
  stok_min: string;
};
