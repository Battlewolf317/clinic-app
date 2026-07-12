import { useState } from "react";
import { login, type AuthUser } from "../../lib/api";
import { t, inp, lbl } from "../shell/ui";

export default function LoginPage({ onLogin }: { onLogin: (u: AuthUser) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try { onLogin(await login(username.trim(), password)); }
    catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, fontFamily: "'Segoe UI', sans-serif" }}>
      <form onSubmit={submit} style={{ background: "#fff", padding: 32, borderRadius: 16, width: 340, boxShadow: "0 10px 40px rgba(0,0,0,.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>🧴</div>
          <h1 style={{ margin: "8px 0 2px", fontSize: 20, color: t.text }}>Klinik Perawatan Kulit</h1>
          <p style={{ margin: 0, fontSize: 12, color: t.textSub }}>SkinCare Clinic System</p>
        </div>
        <label style={lbl}>Username</label>
        <input style={inp} value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        <div style={{ height: 12 }} />
        <label style={lbl}>Password</label>
        <input style={inp} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p style={{ color: t.red, fontSize: 13, marginTop: 12 }}>⚠️ {error}</p>}
        <button type="submit" disabled={loading} style={{ width: "100%", marginTop: 20, padding: 12, border: "none", borderRadius: 8, background: t.primary, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          {loading ? "Memproses..." : "Masuk"}
        </button>
        <p style={{ fontSize: 11, color: t.textSub, textAlign: "center", marginTop: 16 }}>
          Demo: admin / resepsionis / dokter / farmasi<br />(password: &lt;user&gt;123)
        </p>
      </form>
    </div>
  );
}
