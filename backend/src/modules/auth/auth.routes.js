import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../../config/db.js";
import { JWT_SECRET, JWT_EXPIRES } from "../../config/security.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "Username & password wajib diisi" });
    const r = await pool.query("SELECT * FROM app_user WHERE username = $1 AND active = true", [username]);
    const user = r.rows[0];
    if (!user) return res.status(400).json({ error: "Username atau password salah" });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: "Username atau password salah" });
    const payload = { id: user.id, username: user.username, nama: user.nama, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, user: payload });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.get("/me", authenticate, (req, res) => res.json({ user: req.user }));

export default router;
