// =====================================================================
// app.js — ENTRY POINT backend Klinik Perawatan Kulit
// =====================================================================

import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb } from "./config/db.js";
import { authenticate } from "./middleware/auth.js";
import { ALLOWED_ORIGINS } from "./config/security.js";

import authRoutes from "./modules/auth/auth.routes.js";
import pasienRoutes from "./modules/pasien/pasien.routes.js";
import kunjunganRoutes from "./modules/kunjungan/kunjungan.routes.js";
import konsultasiRoutes from "./modules/konsultasi/konsultasi.routes.js";
import produkRoutes from "./modules/produk/produk.routes.js";
import farmasiRoutes from "./modules/farmasi/farmasi.routes.js";

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => res.send("Klinik Kulit backend jalan!"));

app.use("/api/auth", authRoutes);
app.use("/api/pasien", authenticate, pasienRoutes);
app.use("/api/kunjungan", authenticate, kunjunganRoutes);
app.use("/api/konsultasi", authenticate, konsultasiRoutes);
app.use("/api/produk", authenticate, produkRoutes);
app.use("/api/farmasi", authenticate, farmasiRoutes);

const PORT = process.env.PORT || 3002;
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Klinik Kulit backend jalan di http://localhost:${PORT} (DB: klinik_kulit)`);
    });
  })
  .catch((err) => console.error("❌ Gagal init database:", err.message));
