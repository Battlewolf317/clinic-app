import { Router } from "express";
import * as service from "./pasien.service.js";
import { ValidationError } from "./pasien.service.js";
import { authorize } from "../../middleware/auth.js";

const router = Router();

function handle(res, e) {
  if (e instanceof ValidationError) return res.status(400).json({ error: e.message });
  console.error(e);
  return res.status(500).json({ error: "Terjadi kesalahan server" });
}

router.get("/", async (req, res) => {
  try { res.json(await service.list(req.query.q)); } catch (e) { handle(res, e); }
});
router.get("/:id", async (req, res) => {
  try { res.json(await service.getById(req.params.id)); } catch (e) { handle(res, e); }
});
router.post("/", authorize("resepsionis"), async (req, res) => {
  try { res.status(201).json(await service.create(req.body)); } catch (e) { handle(res, e); }
});
router.put("/:id", authorize("resepsionis"), async (req, res) => {
  try { res.json(await service.update(req.params.id, req.body)); } catch (e) { handle(res, e); }
});

export default router;
