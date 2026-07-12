import { useState } from "react";
import { getUser, clearAuth, type AuthUser } from "./lib/api";
import { getWorkEnv, type PageKey } from "./features/shell/menuConfig";
import { t } from "./features/shell/ui";
import LoginPage from "./features/auth/LoginPage";
import PendaftaranPage from "./features/pendaftaran/PendaftaranPage";
import KonsultasiPage from "./features/konsultasi/KonsultasiPage";
import FarmasiPage from "./features/farmasi/FarmasiPage";
import ProdukPage from "./features/produk/ProdukPage";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(getUser());
  if (!user) return <LoginPage onLogin={setUser} />;
  return <Shell user={user} onLogout={() => { clearAuth(); setUser(null); }} />;
}

function Shell({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const env = getWorkEnv(user.role);
  const [active, setActive] = useState<PageKey>(env.items[0].key);
  const activeItem = env.items.find((i) => i.key === active) ?? env.items[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      <header style={{ background: t.primary, color: "#fff", height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>🧴 Klinik Perawatan Kulit</div>
        <div style={{ fontSize: 12, textAlign: "right", lineHeight: 1.3 }}>
          <div><b>{user.nama}</b></div>
          <div style={{ opacity: 0.85 }}>{env.label}</div>
        </div>
      </header>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <aside style={{ width: 230, background: "#fff", borderRight: `1px solid ${t.line}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <nav style={{ flex: 1, padding: 10 }}>
            {env.items.map((it) => {
              const on = it.key === active;
              return (
                <button key={it.key} onClick={() => setActive(it.key)}
                  style={{ width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 4, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, display: "flex", gap: 10, alignItems: "center", background: on ? t.primary : "transparent", color: on ? "#fff" : t.text, fontWeight: on ? 600 : 400 }}>
                  <span>{it.icon}</span> {it.label}
                </button>
              );
            })}
          </nav>
          <button onClick={onLogout} style={{ margin: 10, padding: "10px 12px", border: `1px solid ${t.line}`, borderRadius: 8, cursor: "pointer", fontSize: 13, color: t.red, background: "#fff" }}>
            🚪 Keluar
          </button>
        </aside>
        <main style={{ flex: 1, padding: 22, overflow: "auto", background: t.bgZebra }}>
          <h2 style={{ margin: "0 0 16px", color: t.primaryDark, fontSize: 20 }}>{activeItem.icon} {activeItem.label}</h2>
          {active === "pendaftaran" && <PendaftaranPage role={user.role} />}
          {active === "konsultasi" && <KonsultasiPage user={user} />}
          {active === "farmasi" && <FarmasiPage role={user.role} />}
          {active === "produk" && <ProdukPage role={user.role} />}
        </main>
      </div>
    </div>
  );
}
