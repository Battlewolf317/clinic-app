import { Router } from "express";
import * as service from "./farmasi.service.js";
import { ValidationError } from "./farmasi.service.js";
import { authorize } from "../../middleware/auth.js";

const router = Router();
function handle(res, e) {
  if (e instanceof ValidationError) return res.status(400).json({ error: e.message });
  console.error(e);
  return res.status(500).json({ error: "Terjadi kesalahan server" });
}

router.get("/antrian", async (req, res) => {
  try { res.json(await service.antrian()); } catch (e) { handle(res, e); }
});
router.get("/by-kunjungan/:kunjunganId", async (req, res) => {
  try { res.json(await service.detail(req.params.kunjunganId)); } catch (e) { handle(res, e); }
});
router.patch("/resep/:itemId/dispense", authorize("farmasi"), async (req, res) => {
  try { res.json(await service.dispense(req.params.itemId)); } catch (e) { handle(res, e); }
});
router.patch("/by-kunjungan/:kunjunganId/selesai", authorize("farmasi"), async (req, res) => {
  try { res.json(await service.selesai(req.params.kunjunganId)); } catch (e) { handle(res, e); }
});

export default router;
