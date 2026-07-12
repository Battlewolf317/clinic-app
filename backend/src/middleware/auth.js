// =====================================================================
// middleware/auth.js — JWT authenticate + authorize (RBAC)
// =====================================================================

import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/security.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Token tidak ada, silakan login" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token tidak valid / kadaluarsa" });
  }
}

// admin selalu boleh
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Belum login" });
    if (req.user.role === "admin" || roles.includes(req.user.role)) return next();
    return res.status(403).json({ error: "Akses ditolak untuk role Anda" });
  };
}
