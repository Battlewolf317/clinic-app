// =====================================================================
// menuConfig.ts — menu per role
// =====================================================================

export type PageKey = "pendaftaran" | "konsultasi" | "farmasi" | "produk";

export type MenuItem = { key: PageKey; label: string; icon: string };
export type WorkEnv = { label: string; items: MenuItem[] };

const ALL: Record<PageKey, MenuItem> = {
  pendaftaran: { key: "pendaftaran", label: "Pendaftaran", icon: "📝" },
  konsultasi: { key: "konsultasi", label: "Konsultasi Dokter", icon: "🩺" },
  farmasi: { key: "farmasi", label: "Farmasi", icon: "💊" },
  produk: { key: "produk", label: "Master Produk", icon: "🧴" },
};

const ROLE_MENU: Record<string, WorkEnv> = {
  admin: { label: "Administrator", items: [ALL.pendaftaran, ALL.konsultasi, ALL.farmasi, ALL.produk] },
  resepsionis: { label: "Resepsionis", items: [ALL.pendaftaran] },
  dokter: { label: "Dokter", items: [ALL.konsultasi] },
  farmasi: { label: "Apoteker / Farmasi", items: [ALL.farmasi, ALL.produk] },
};

export function getWorkEnv(role: string): WorkEnv {
  return ROLE_MENU[role] ?? { label: role, items: [ALL.pendaftaran] };
}
