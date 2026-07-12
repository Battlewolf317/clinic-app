# Deploy — Clinic App (Klinik)

Arsitektur: **Frontend (Vite/React)** → Vercel · **Backend (Express)** → Render/Railway · **DB (PostgreSQL)** → Neon.

Sudah disesuaikan untuk deploy: backend baca `DATABASE_URL` (SSL) & `CORS_ORIGINS`, frontend baca `VITE_API_BASE`.

---

## 1. Database — Neon (PostgreSQL gratis)
1. Buat project di https://neon.tech → salin **connection string** (`...?sslmode=require`).
2. Pakai sebagai `DATABASE_URL`. Tabel + seed (produk skincare/obat/tindakan, pasien contoh, user) dibuat otomatis saat start.

## 2. Backend — Render (root: `backend/`)
- **Build**: `npm install` · **Start**: `npm start` (atau `Procfile`)
- **Environment variables**:
  | Key | Value |
  |-----|-------|
  | `DATABASE_URL` | (dari Neon) |
  | `NODE_ENV` | `production` |
  | `JWT_SECRET` | string acak **≥16 char** (wajib saat production) |
  | `JWT_EXPIRES` | `8h` |
  | `CORS_ORIGINS` | URL frontend Vercel |
- Catat URL backend, mis. `https://klinik-api.onrender.com`.

> ⚠️ `NODE_ENV=production` mewajibkan `JWT_SECRET` ≥16 char (dicek di `config/security.js`).

## 3. Frontend — Vercel (root: `frontend/`)
- **Framework**: Vite · **Build**: `npm run build` · **Output**: `dist`
- **Env**: `VITE_API_BASE = https://klinik-api.onrender.com/api`
- `vercel.json` (SPA rewrite) sudah ada.
- Deploy → dapat URL, mis. `https://klinik-app.vercel.app`.

## 4. Hubungkan (urutan)
1. Backend dulu → dapat URL.
2. Frontend dengan `VITE_API_BASE`.
3. Update `CORS_ORIGINS` backend = URL frontend → redeploy.

## Opsi Cepat — DEMO MODE (frontend-only, tanpa backend & DB)

Buat live demo portfolio yang instan & selalu nyala (tanpa Render/Neon):
1. Deploy **frontend saja** ke Vercel (root `frontend/`).
2. **JANGAN set `VITE_API_BASE`** (atau set `VITE_DEMO=1`).
3. App otomatis pakai data mock in-memory (`src/lib/mockApi.ts`) — alur daftar → konsultasi → farmasi jalan penuh. Data reset tiap reload (aman).

> Kode backend tetap ada di repo (bukti skill full-stack), tapi demo publik ga perlu server hidup.

## 5. Demo login
`admin/admin123` · `resepsionis/resepsionis123` · `dokter/dokter123` · `farmasi/farmasi123`

Alur demo: Pendaftaran (resepsionis) → Konsultasi (dokter) → Farmasi (dispense).

---

## Checklist
- [ ] Neon DB + `DATABASE_URL`
- [ ] Backend live (env lengkap, `NODE_ENV=production`, `JWT_SECRET`≥16)
- [ ] Frontend live (`VITE_API_BASE` di-set)
- [ ] `CORS_ORIGINS` = URL frontend
- [ ] Test alur daftar → konsultasi → farmasi
- [ ] Update tombol **Live Demo** di portfolio
