// =====================================================================
// config/security.js — JWT secret & CORS (terpusat)
// =====================================================================

const isProd = process.env.NODE_ENV === "production";
const envSecret = process.env.JWT_SECRET;

if (isProd && (!envSecret || envSecret.length < 16)) {
  throw new Error("JWT_SECRET wajib di-set (min 16 char) saat NODE_ENV=production.");
}
if (!envSecret) {
  console.warn("⚠️  JWT_SECRET belum di-set — pakai dev secret (tidak aman untuk production).");
}

export const JWT_SECRET = envSecret || "klinik_dev_secret_change_me";
export const JWT_EXPIRES = process.env.JWT_EXPIRES || "8h";
export const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5175,http://localhost:5173")
  .split(",").map((s) => s.trim()).filter(Boolean);
