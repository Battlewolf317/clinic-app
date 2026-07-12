import { Router } from "express";
import * as repo from "./produk.repository.js";
import { authorize } from "../../middleware/auth.js";

const router = Router();
const KATEGORI = ["OBAT", "SKINCARE", "TINDAKAN"];

router.get("/", async (req, res) => {
  try { res.json(await repo.findAll({ q: req.query.q, kategori: req.query.kategori })); }
  catch (e) { console.error(e); res.status(500).json({ error: "Terjadi kesalahan server" }); }
});

router.post("/", authorize("farmasi"), async (req, res) => {
  try {
    const d = req.body || {};
    if (!d.kode || !d.nama) return res.status(400).json({ error: "Kode & nama wajib diisi" });
    if (!KATEGORI.includes(d.kategori)) return res.status(400).json({ error: "Kategori tidak valid" });
    res.status(201).json(await repo.insert(d));
  } catch (e) {
    if (e.code === "23505") return res.status(400).json({ error: "Kode produk sudah dipakai" });
    console.error(e); res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.put("/:id", authorize("farmasi"), async (req, res) => {
  try {
    const d = req.body || {};
    if (!d.nama) return res.status(400).json({ error: "Nama wajib diisi" });
    if (!KATEGORI.includes(d.kategori)) return res.status(400).json({ error: "Kategori tidak valid" });
    const updated = await repo.update(req.params.id, d);
    if (!updated) return res.status(404).json({ error: "Produk tidak ditemukan" });
    res.json(updated);
  } catch (e) { console.error(e); res.status(500).json({ error: "Terjadi kesalahan server" }); }
});

export default router;
