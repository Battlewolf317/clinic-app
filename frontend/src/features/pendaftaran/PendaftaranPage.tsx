import { useState, useEffect, useCallback } from "react";
import type { Pasien, Kunjungan } from "../../lib/types";
import { getPasien, createPasien, updatePasien, getKunjungan, createKunjungan } from "./api";
import { t, Toolbar, Btn, Badge, inp, lbl, th, td, tableStyle, STATUS_COLOR } from "../shell/ui";

const KULIT = ["NORMAL", "KERING", "BERMINYAK", "KOMBINASI", "SENSITIF"];
const PASIEN_KOSONG: Partial<Pasien> = { nama: "", no_hp: "", jenis_kelamin: "P", jenis_kulit: "NORMAL", alamat: "", alergi: "", tgl_lahir: "" };

export default function PendaftaranPage({ role }: { role: string }) {
  const canManage = role === "resepsionis" || role === "admin";
  const [tab, setTab] = useState<"kunjungan" | "pasien">("kunjungan");

  return (
    <div>
      <Toolbar>
        <Btn primary={tab === "kunjungan"} onClick={() => setTab("kunjungan")}>🗓️ Kunjungan</Btn>
        <Btn primary={tab === "pasien"} onClick={() => setTab("pasien")}>👤 Data Pasien</Btn>
      </Toolbar>
      {tab === "kunjungan" ? <KunjunganTab canManage={canManage} /> : <PasienTab canManage={canManage} />}
    </div>
  );
}

// ---------------- TAB KUNJUNGAN ----------------
function KunjunganTab({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<Kunjungan[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [pasienList, setPasienList] = useState<Pasien[]>([]);
  const [form, setForm] = useState({ pasien_id: "", jenis: "KONSULTASI", keluhan: "" });
  const [error, setError] = useState("");

  const muat = useCallback(async () => {
    setLoading(true);
    try { setRows(await getKunjungan(status)); } finally { setLoading(false); }
  }, [status]);
  useEffect(() => { muat(); }, [muat]);

  async function bukaForm() {
    setForm({ pasien_id: "", jenis: "KONSULTASI", keluhan: "" });
    setError("");
    setPasienList(await getPasien());
    setOpen(true);
  }
  async function simpan(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!form.pasien_id) { setError("Pilih pasien dulu"); return; }
    try {
      await createKunjungan({ pasien_id: Number(form.pasien_id), jenis: form.jenis, keluhan: form.keluhan });
      setOpen(false); muat();
    } catch (err) { setError((err as Error).message); }
  }

  return (
    <div>
      <Toolbar>
        {canManage && <Btn primary icon="➕" onClick={bukaForm}>Kunjungan Baru</Btn>}
        <Btn icon="🔄" onClick={muat}>Refresh</Btn>
        <select style={{ ...inp, width: 150 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua Status</option>
          {["DAFTAR", "KONSULTASI", "FARMASI", "SELESAI", "BATAL"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ marginLeft: "auto", fontSize: 12, color: t.textSub }}>{!loading && `${rows.length} kunjungan`}</span>
      </Toolbar>

      {open && (
        <form onSubmit={simpan} style={panel}>
          <h3 style={panelH}>Kunjungan Baru</h3>
          <div style={grid}>
            <div>
              <label style={lbl}>Pasien *</label>
              <select style={inp} value={form.pasien_id} onChange={(e) => setForm({ ...form, pasien_id: e.target.value })}>
                <option value="">-- pilih pasien --</option>
                {pasienList.map((p) => <option key={p.id} value={p.id}>{p.no_rm} — {p.nama}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Jenis</label>
              <select style={inp} value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
                {["KONSULTASI", "TREATMENT", "KONTROL"].map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={lbl}>Keluhan</label>
              <input style={inp} value={form.keluhan} onChange={(e) => setForm({ ...form, keluhan: e.target.value })} placeholder="mis. jerawat, kulit kusam, gatal..." />
            </div>
          </div>
          {error && <p style={{ color: t.red, margin: "8px 0 0" }}>⚠️ {error}</p>}
          <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
            <Btn type="submit" primary icon="💾">Daftar</Btn>
            <Btn onClick={() => setOpen(false)}>Batal</Btn>
          </div>
        </form>
      )}

      {loading ? <p>Memuat...</p> : (
        <table style={tableStyle}>
          <thead><tr><th style={th}>Kode</th><th style={th}>Pasien</th><th style={th}>Jenis</th><th style={th}>Keluhan</th><th style={th}>Status</th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td style={td} colSpan={5}>Belum ada kunjungan.</td></tr> :
              rows.map((k, i) => (
                <tr key={k.id} style={{ background: i % 2 ? t.bgZebra : "#fff" }}>
                  <td style={td}>{k.kode}</td>
                  <td style={td}>{k.pasien_nama}<div style={{ fontSize: 11, color: t.textSub }}>{k.no_rm}</div></td>
                  <td style={td}>{k.jenis}</td>
                  <td style={td}>{k.keluhan || "-"}</td>
                  <td style={td}><Badge text={k.status} color={STATUS_COLOR[k.status] ?? t.textSub} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ---------------- TAB PASIEN ----------------
function PasienTab({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<Pasien[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pasien | null>(null);
  const [form, setForm] = useState<Partial<Pasien>>(PASIEN_KOSONG);
  const [error, setError] = useState("");

  const muat = useCallback(async () => {
    setLoading(true);
    try { setRows(await getPasien(q)); } finally { setLoading(false); }
  }, [q]);
  useEffect(() => { muat(); /* eslint-disable-next-line */ }, []);

  function bukaBaru() { setEditing(null); setForm(PASIEN_KOSONG); setError(""); setOpen(true); }
  function bukaEdit(p: Pasien) {
    setEditing(p);
    setForm({ ...p, tgl_lahir: p.tgl_lahir ? p.tgl_lahir.slice(0, 10) : "" });
    setError(""); setOpen(true);
  }
  async function simpan(e: React.FormEvent) {
    e.preventDefault(); setError("");
    try {
      if (editing) await updatePasien(editing.id, form); else await createPasien(form);
      setOpen(false); muat();
    } catch (err) { setError((err as Error).message); }
  }

  return (
    <div>
      <Toolbar>
        {canManage && <Btn primary icon="➕" onClick={bukaBaru}>Pasien Baru</Btn>}
        <input style={{ ...inp, width: 220 }} placeholder="Cari nama / no RM / HP..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && muat()} />
        <Btn icon="🔍" onClick={muat}>Cari</Btn>
        <span style={{ marginLeft: "auto", fontSize: 12, color: t.textSub }}>{!loading && `${rows.length} pasien`}</span>
      </Toolbar>

      {open && (
        <form onSubmit={simpan} style={panel}>
          <h3 style={panelH}>{editing ? `Edit Pasien — ${editing.no_rm}` : "Pasien Baru"}</h3>
          <div style={grid}>
            <div><label style={lbl}>Nama *</label><input style={inp} value={form.nama || ""} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></div>
            <div><label style={lbl}>No. HP</label><input style={inp} value={form.no_hp || ""} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} /></div>
            <div>
              <label style={lbl}>Jenis Kelamin</label>
              <select style={inp} value={form.jenis_kelamin || "P"} onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}>
                <option value="P">Perempuan</option><option value="L">Laki-laki</option>
              </select>
            </div>
            <div><label style={lbl}>Tgl Lahir</label><input style={inp} type="date" value={form.tgl_lahir || ""} onChange={(e) => setForm({ ...form, tgl_lahir: e.target.value })} /></div>
            <div>
              <label style={lbl}>Jenis Kulit</label>
              <select style={inp} value={form.jenis_kulit || "NORMAL"} onChange={(e) => setForm({ ...form, jenis_kulit: e.target.value })}>
                {KULIT.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Alergi</label><input style={inp} value={form.alergi || ""} onChange={(e) => setForm({ ...form, alergi: e.target.value })} /></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Alamat</label><input style={inp} value={form.alamat || ""} onChange={(e) => setForm({ ...form, alamat: e.target.value })} /></div>
          </div>
          {error && <p style={{ color: t.red, margin: "8px 0 0" }}>⚠️ {error}</p>}
          <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
            <Btn type="submit" primary icon="💾">Simpan</Btn>
            <Btn onClick={() => setOpen(false)}>Batal</Btn>
          </div>
        </form>
      )}

      {loading ? <p>Memuat...</p> : (
        <table style={tableStyle}>
          <thead><tr><th style={th}>No. RM</th><th style={th}>Nama</th><th style={th}>JK</th><th style={th}>Jenis Kulit</th><th style={th}>No. HP</th>{canManage && <th style={{ ...th, width: 90 }}>Aksi</th>}</tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td style={td} colSpan={6}>Belum ada pasien.</td></tr> :
              rows.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 ? t.bgZebra : "#fff" }}>
                  <td style={td}>{p.no_rm}</td>
                  <td style={td}>{p.nama}</td>
                  <td style={td}>{p.jenis_kelamin === "L" ? "L" : "P"}</td>
                  <td style={td}>{p.jenis_kulit || "-"}</td>
                  <td style={td}>{p.no_hp || "-"}</td>
                  {canManage && <td style={td}><Btn icon="✏️" onClick={() => bukaEdit(p)}>Edit</Btn></td>}
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const panel: React.CSSProperties = { border: `1px solid ${t.line}`, borderRadius: 8, padding: 16, marginBottom: 12, background: "#fff" };
const panelH: React.CSSProperties = { margin: "0 0 12px", fontSize: 15, color: t.text };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 };
