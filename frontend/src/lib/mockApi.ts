// =====================================================================
// mockApi.ts — Backend TIRUAN (in-memory) untuk DEMO MODE tanpa server.
// Dipakai otomatis saat VITE_API_BASE kosong atau VITE_DEMO=1.
// Data reset tiap reload halaman (aman untuk demo publik).
// =====================================================================

type Any = Record<string, unknown>;

// ---------- Seed data (mengikuti backend config/db.js) ----------
let pasien: Any[] = [
  { id: 1, no_rm: "RM0001", nama: "SARI DEWI", no_hp: "081234567890", jenis_kelamin: "P", tgl_lahir: "1995-04-12", alamat: "Jl. Kenanga No. 5, Jakarta", jenis_kulit: "KOMBINASI", alergi: "Tidak ada" },
  { id: 2, no_rm: "RM0002", nama: "RANGGA PUTRA", no_hp: "081298765432", jenis_kelamin: "L", tgl_lahir: "1990-09-20", alamat: "Jl. Melati No. 8, Jakarta", jenis_kulit: "BERMINYAK", alergi: "Penisilin" },
];

let produk: Any[] = [
  ["SKN001", "Serum Vitamin C 20ml", "SKINCARE", "BTL", 185000, 40, 10],
  ["SKN002", "Sunscreen SPF 50 PA+++ 50ml", "SKINCARE", "TUBE", 145000, 60, 15],
  ["SKN003", "Retinol 0.5% Serum 30ml", "SKINCARE", "BTL", 225000, 25, 10],
  ["SKN004", "Niacinamide 10% 30ml", "SKINCARE", "BTL", 135000, 35, 10],
  ["SKN005", "Gentle Cleanser 100ml", "SKINCARE", "BTL", 95000, 50, 15],
  ["SKN006", "Moisturizer Ceramide 50ml", "SKINCARE", "JAR", 165000, 30, 10],
  ["OBT001", "Antibiotik Topikal (Clindamycin) 15g", "OBAT", "TUBE", 75000, 40, 10],
  ["OBT002", "Tretinoin 0.025% Cream 20g", "OBAT", "TUBE", 120000, 20, 8],
  ["OBT003", "Asam Salisilat 2% Solution 60ml", "OBAT", "BTL", 85000, 30, 10],
  ["OBT004", "Antihistamin (Cetirizine) Tablet", "OBAT", "TAB", 2500, 500, 100],
  ["TND001", "Facial Treatment Basic", "TINDAKAN", "SESI", 250000, 0, 0],
  ["TND002", "Chemical Peeling", "TINDAKAN", "SESI", 450000, 0, 0],
  ["TND003", "Mikrodermabrasi", "TINDAKAN", "SESI", 400000, 0, 0],
  ["TND004", "Laser Rejuvenation", "TINDAKAN", "SESI", 850000, 0, 0],
  ["TND005", "Ekstraksi Komedo", "TINDAKAN", "SESI", 150000, 0, 0],
].map((r, i) => ({
  id: i + 1, kode: r[0], nama: r[1], kategori: r[2], satuan: r[3],
  harga: String(r[4]), stok: String(r[5]), stok_min: String(r[6]),
}));

let kunjungan: Any[] = [];
let konsultasi: Any[] = [];
let resep: Any[] = [];

const users: Record<string, { id: number; nama: string; role: string; pass: string }> = {
  admin: { id: 1, nama: "Administrator", role: "admin", pass: "admin123" },
  resepsionis: { id: 2, nama: "RESEPSIONIS 1", role: "resepsionis", pass: "resepsionis123" },
  dokter: { id: 3, nama: "dr. AYU SpKK", role: "dokter", pass: "dokter123" },
  farmasi: { id: 4, nama: "APOTEKER", role: "farmasi", pass: "farmasi123" },
};

let seqKunjungan = 0, seqPasien = 2, seqKonsul = 0, seqResep = 0;

// contoh 1 kunjungan awal biar antrian ga kosong
(function seedVisit() {
  seqKunjungan++;
  kunjungan.push({
    id: seqKunjungan, kode: `K${String(seqKunjungan).padStart(4, "0")}`,
    pasien_id: 1, tanggal: new Date().toISOString(), jenis: "KONSULTASI",
    keluhan: "Kulit wajah berjerawat & kusam", status: "DAFTAR",
  });
})();

// ---------- Helper ----------
const pasienJoin = (k: Any): Any => {
  const p: Any = pasien.find((x) => x.id === k.pasien_id) || {};
  return { ...k, pasien_nama: p.nama, no_rm: p.no_rm, jenis_kelamin: p.jenis_kelamin, jenis_kulit: p.jenis_kulit, alergi: p.alergi };
};
const resepJoin = (r: Any): Any => {
  const p: Any = produk.find((x) => x.id === r.produk_id) || {};
  return { ...r, produk_nama: p.nama, produk_kode: p.kode, kategori: p.kategori, satuan: p.satuan, stok_tersedia: p.stok };
};
const num = (v: unknown) => Number(v || 0);
const delay = <T,>(v: T) => new Promise<T>((res) => setTimeout(() => res(v), 180));

// ---------- Router ----------
export async function mockRequest<T = unknown>(rawPath: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const [pathOnly, query = ""] = rawPath.split("?");
  const qs = new URLSearchParams(query);
  const body: Any = options.body ? JSON.parse(options.body as string) : {};
  const seg = pathOnly.split("/").filter(Boolean); // e.g. ["konsultasi","by-kunjungan","3"]

  // ---- AUTH ----
  if (pathOnly === "/auth/login" && method === "POST") {
    const u = users[String(body.username)];
    if (!u || u.pass !== body.password) throw new Error("Username / password salah");
    return delay({ token: `demo.${u.role}.${Date.now()}`, user: { id: u.id, username: String(body.username), nama: u.nama, role: u.role } } as unknown as T);
  }

  // ---- PRODUK ----
  if (pathOnly === "/produk" && method === "GET") {
    const kat = qs.get("kategori");
    return delay((kat ? produk.filter((p) => p.kategori === kat) : produk) as unknown as T);
  }
  if (pathOnly === "/produk" && method === "POST") {
    const p = { id: produk.length + 1, kode: body.kode || `NEW${produk.length + 1}`, nama: body.nama, kategori: body.kategori || "SKINCARE", satuan: body.satuan || "PCS", harga: String(body.harga || 0), stok: String(body.stok || 0), stok_min: String(body.stok_min || 0) };
    produk.push(p); return delay(p as unknown as T);
  }
  if (seg[0] === "produk" && seg[1] && method === "PUT") {
    const p = produk.find((x) => x.id === Number(seg[1]));
    if (!p) throw new Error("Produk tidak ditemukan");
    Object.assign(p, { ...body, harga: String(body.harga ?? p.harga), stok: String(body.stok ?? p.stok), stok_min: String(body.stok_min ?? p.stok_min) });
    return delay(p as unknown as T);
  }

  // ---- PASIEN ----
  if (pathOnly === "/pasien" && method === "GET") {
    const q = (qs.get("q") || "").toLowerCase();
    const rows = q ? pasien.filter((p) => String(p.nama).toLowerCase().includes(q) || String(p.no_rm).toLowerCase().includes(q)) : pasien;
    return delay(rows as unknown as T);
  }
  if (pathOnly === "/pasien" && method === "POST") {
    seqPasien++;
    const p = { id: seqPasien, no_rm: `RM${String(seqPasien).padStart(4, "0")}`, nama: body.nama, no_hp: body.no_hp || null, jenis_kelamin: body.jenis_kelamin || null, tgl_lahir: body.tgl_lahir || null, alamat: body.alamat || null, jenis_kulit: body.jenis_kulit || null, alergi: body.alergi || null };
    pasien.push(p); return delay(p as unknown as T);
  }
  if (seg[0] === "pasien" && seg[1] && method === "PUT") {
    const p = pasien.find((x) => x.id === Number(seg[1]));
    if (!p) throw new Error("Pasien tidak ditemukan");
    Object.assign(p, body); return delay(p as unknown as T);
  }

  // ---- KUNJUNGAN ----
  if (pathOnly === "/kunjungan" && method === "GET") {
    const status = qs.get("status"); const q = (qs.get("q") || "").toLowerCase();
    let rows = kunjungan.map(pasienJoin);
    if (status) rows = rows.filter((k) => k.status === status);
    if (q) rows = rows.filter((k) => String(k.pasien_nama).toLowerCase().includes(q) || String(k.no_rm).toLowerCase().includes(q));
    return delay(rows as unknown as T);
  }
  if (pathOnly === "/kunjungan" && method === "POST") {
    seqKunjungan++;
    const k = { id: seqKunjungan, kode: `K${String(seqKunjungan).padStart(4, "0")}`, pasien_id: Number(body.pasien_id), tanggal: new Date().toISOString(), jenis: body.jenis || "KONSULTASI", keluhan: body.keluhan || null, status: "DAFTAR" };
    kunjungan.push(k); return delay(pasienJoin(k) as unknown as T);
  }

  // ---- KONSULTASI ----
  if (seg[0] === "konsultasi" && seg[1] === "by-kunjungan" && seg[2] && !seg[3] && method === "GET") {
    const kId = Number(seg[2]);
    const k = kunjungan.find((x) => x.id === kId);
    const kons = konsultasi.find((x) => x.kunjungan_id === kId) || null;
    const items = kons ? resep.filter((r) => r.konsultasi_id === kons.id).map(resepJoin) : [];
    return delay({ kunjungan: k ? pasienJoin(k) : null, konsultasi: kons, items } as unknown as T);
  }
  if (seg[0] === "konsultasi" && seg[1] === "by-kunjungan" && seg[2] && !seg[3] && method === "POST") {
    const kId = Number(seg[2]);
    let kons = konsultasi.find((x) => x.kunjungan_id === kId);
    if (!kons) { seqKonsul++; kons = { id: seqKonsul, kunjungan_id: kId, dokter: "dr. AYU SpKK", biaya_konsul: "150000" }; konsultasi.push(kons); }
    Object.assign(kons, { anamnesa: body.anamnesa ?? kons.anamnesa, diagnosa: body.diagnosa ?? kons.diagnosa, treatment: body.treatment ?? kons.treatment, catatan: body.catatan ?? kons.catatan, biaya_konsul: String(body.biaya_konsul ?? kons.biaya_konsul ?? 150000) });
    const k = kunjungan.find((x) => x.id === kId); if (k && k.status === "DAFTAR") k.status = "KONSULTASI";
    const items = resep.filter((r) => r.konsultasi_id === kons!.id).map(resepJoin);
    return delay({ konsultasi: kons, items } as unknown as T);
  }
  if (seg[0] === "konsultasi" && seg[1] && seg[2] === "resep" && method === "POST") {
    const konsId = Number(seg[1]);
    const p = produk.find((x) => x.id === Number(body.produk_id));
    if (!p) throw new Error("Produk tidak ditemukan");
    seqResep++;
    const harga = num(p.harga); const qty = num(body.qty) || 1;
    resep.push({ id: seqResep, konsultasi_id: konsId, produk_id: p.id, qty: String(qty), aturan_pakai: body.aturan_pakai || null, harga: String(harga), subtotal: String(harga * qty), status: "RESEP" });
    return delay(resep.filter((r) => r.konsultasi_id === konsId).map(resepJoin) as unknown as T);
  }
  if (seg[0] === "konsultasi" && seg[1] === "resep" && seg[2] && method === "DELETE") {
    const itemId = Number(seg[2]);
    const item = resep.find((r) => r.id === itemId);
    resep = resep.filter((r) => r.id !== itemId);
    return delay((item ? resep.filter((r) => r.konsultasi_id === item.konsultasi_id).map(resepJoin) : []) as unknown as T);
  }
  if (seg[0] === "konsultasi" && seg[1] === "by-kunjungan" && seg[2] && seg[3] === "selesai" && method === "PATCH") {
    const k = kunjungan.find((x) => x.id === Number(seg[2]));
    if (k) k.status = "FARMASI";
    return delay({ status: "FARMASI" } as unknown as T);
  }

  // ---- FARMASI ----
  if (pathOnly === "/farmasi/antrian" && method === "GET") {
    return delay(kunjungan.filter((k) => k.status === "FARMASI").map(pasienJoin) as unknown as T);
  }
  if (seg[0] === "farmasi" && seg[1] === "by-kunjungan" && seg[2] && !seg[3] && method === "GET") {
    const kId = Number(seg[2]);
    const k = kunjungan.find((x) => x.id === kId);
    const kons = konsultasi.find((x) => x.kunjungan_id === kId) || null;
    const items = kons ? resep.filter((r) => r.konsultasi_id === kons.id).map(resepJoin) : [];
    const biaya = kons ? num(kons.biaya_konsul) : 0;
    const totalProduk = items.reduce((s, r) => s + num((r as Any).subtotal), 0);
    return delay({ kunjungan: k ? pasienJoin(k) : null, konsultasi: kons, items, ringkasan: { biaya_konsul: biaya, total_produk: totalProduk, total: biaya + totalProduk } } as unknown as T);
  }
  if (seg[0] === "farmasi" && seg[1] === "resep" && seg[2] && seg[3] === "dispense" && method === "PATCH") {
    const item = resep.find((r) => r.id === Number(seg[2]));
    if (!item) throw new Error("Resep tidak ditemukan");
    item.status = "DISPENSED";
    const p = produk.find((x) => x.id === item.produk_id);
    if (p && p.kategori !== "TINDAKAN") p.stok = String(Math.max(0, num(p.stok) - num(item.qty)));
    return delay(resepJoin(item) as unknown as T);
  }
  if (seg[0] === "farmasi" && seg[1] === "by-kunjungan" && seg[2] && seg[3] === "selesai" && method === "PATCH") {
    const k = kunjungan.find((x) => x.id === Number(seg[2]));
    if (k) k.status = "SELESAI";
    return delay({ status: "SELESAI" } as unknown as T);
  }

  throw new Error(`[DEMO] Endpoint belum di-mock: ${method} ${pathOnly}`);
}
