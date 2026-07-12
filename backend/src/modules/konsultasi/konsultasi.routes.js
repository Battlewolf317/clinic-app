import { Router } from "express";
import * as service from "./konsultasi.service.js";
import { ValidationError } from "./konsultasi.service.js";
import { authorize } from "../../middleware/auth.js";

const router = Router();
function handle(res, e) {
  if (e instanceof ValidationError) return res.status(400).json({ error: e.message });
  console.error(e);
  return res.status(500).json({ error: "Terjadi kesalahan server" });
}

// ambil konsultasi + resep utk satu kunjungan
router.get("/by-kunjungan/:kunjunganId", async (req, res) => {
  try { res.json(await service.getByKunjungan(req.params.kunjunganId)); } catch (e) { handle(res, e); }
});

// simpan konsultasi (dokter)
router.post("/by-kunjungan/:kunjunganId", authorize("dokter"), async (req, res) => {
  try { res.json(await service.save(req.params.kunjunganId, req.body)); } catch (e) { handle(res, e); }
});

// tambah / hapus item resep
router.post("/:konsultasiId/resep", authorize("dokter"), async (req, res) => {
  try { res.status(201).json(await service.addResepItem(req.params.konsultasiId, req.body)); } catch (e) { handle(res, e); }
});
router.delete("/resep/:itemId", authorize("dokter"), async (req, res) => {
  try { res.json(await service.removeResepItem(req.params.itemId)); } catch (e) { handle(res, e); }
});

// selesaikan konsultasi → FARMASI / SELESAI
router.patch("/by-kunjungan/:kunjunganId/selesai", authorize("dokter"), async (req, res) => {
  try { res.json(await service.selesai(req.params.kunjunganId)); } catch (e) { handle(res, e); }
});

export default router;
