# Klinik Perawatan Kulit — Progress

> Aplikasi klinik skincare/dermatologi. Stack: React+Vite+TS (frontend) · Node/Express (backend) · PostgreSQL.
> Pola modular sama seperti his-app. Dibuat: 19.06.2026.

## Alur Bisnis
```
Pasien datang → PENDAFTARAN (resepsionis: daftar pasien + buat kunjungan)
   → status DAFTAR
   → KONSULTASI (dokter: anamnesa, diagnosa, treatment, resep) → status FARMASI
   → FARMASI (apoteker: dispense produk/skincare, potong stok) → status SELESAI
```

## Modul
| # | Modul | Role | Fungsi |
|---|-------|------|--------|
| 1 | Pendaftaran | resepsionis/admin | CRUD pasien + buat kunjungan + antrian |
| 2 | Konsultasi Dokter | dokter/admin | input anamnesa/diagnosa/treatment + resep produk |
| 3 | Farmasi | farmasi/admin | lihat resep, dispense, potong stok produk |
| - | Master Produk | admin/farmasi | obat/skincare/tindakan + stok + harga |
| - | Auth/RBAC | semua | login, role |

## Port & DB
- Backend: 3002 (his-app pakai 3001)
- Frontend: 5175
- DB: `klinik_kulit`

## Status Build
- [ ] Backend: schema + seed
- [ ] Backend: auth, pasien, kunjungan, konsultasi, produk, resep/farmasi
- [ ] Frontend: login + 3 modul + master produk
- [ ] Verifikasi: tsc + boot + smoke test

## Demo Users (password: <user>123)
- admin / admin123
- resepsionis / resepsionis123
- dokter / dokter123
- farmasi / farmasi123
