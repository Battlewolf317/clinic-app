import { useState, useEffect, useCallback } from "react";
import type { Produk } from "../../lib/types";
import { getProduk, createProduk, updateProduk } from "./api";
import { t, Toolbar, Btn, Badge, inp, lbl, th, td, tableStyle, rupiah } from "../shell/ui";

const KATEGORI = ["OBAT", "SKINCARE", "TINDAKAN"];
const KAT_COLOR: Record<string, string> = { OBAT: t.blue, SKINCARE: t.accent, TINDAKAN: t.amber };
const KOSONG: Partial<Produk> = { kode: "", nama: "", kategori: "SKINCARE", satuan: "PCS", harga: "0", stok: "0", stok_min: "0" };

export default function ProdukPage({ role }: { role: string }) {
  const canManage = role === "farmasi" || role === "admin";
  const [rows, setRows] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [kategori, setKategori] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Produk | null>(null);
  const [form, setForm] = useState<Partial<Produk>>(KOSONG);
  const [error, setError] = useState("");

  const muat = useCallback(async () => {
    setLoading(true);
    try { setRows(await getProduk(q, kategori)); } finally { setLoading(false); }
  }, [q, kategori]);
  useEffect(() => { muat(); /* eslint-disable-next-line */ }, [kategori]);

  function bukaBaru() { setEditing(null); setForm(KOSONG); setError(""); setOpen(true); }
  function bukaEdit(p: Produk) { setEditing(p); setForm({ ...p }); setError(""); setOpen(true); }
  async function simpan(e: React.FormEvent) {
    e.preventDefault(); setError("");
    try {
      if (editing) await updateProduk(editing.id, form); else await createProduk(form);
      setOpen(false); muat();
    } catch (err) { setError((err as Error).message); }
  }

  return (
    <div>
      <Toolbar>
        {canManage && <Btn primary icon="➕" onClick={bukaBaru}>Produk Baru</Btn>}
        <Btn icon="🔄" onClick={muat}>Refresh</Btn>
        <input style={{ ...inp, width: 200 }} placeholder="Cari nama / kode..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && muat()} />
        <select style={{ ...inp, width: 140 }} value={kategori} onChange={(e) => setKategori(e.target.value)}>
          <option value="">Semua Kategori</option>
          {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <Btn icon="🔍" onClick={muat}>Cari</Btn>
        <span style={{ marginLeft: "auto", fontSize: 12, color: t.textSub }}>{!loading && `${rows.length} produk`}</span>
      </Toolbar>

      {open && (
        <form onSubmit={simpan} style={{ border: `1px solid ${t.line}`, borderRadius: 8, padding: 16, marginBottom: 12, background: "#fff" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, color: t.text }}>{editing ? `Edit — ${editing.kode}` : "Produk Baru"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
            <div><label style={lbl}>Kode *</label><input style={{ ...inp, background: editing ? "#eee" : "#fff" }} value={form.kode || ""} disabled={!!editing} onChange={(e) => setForm({ ...form, kode: e.target.value })} /></div>
            <div style={{ gridColumn: "span 2" }}><label style={lbl}>Nama *</label><input style={inp} value={form.nama || ""} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></div>
            <div>
              <label style={lbl}>Kategori</label>
              <select style={inp} value={form.kategori || "SKINCARE"} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
                {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Satuan</label><input style={inp} value={form.satuan || ""} onChange={(e) => setForm({ ...form, satuan: e.target.value })} /></div>
            <div><label style={lbl}>Harga</label><input style={inp} type="number" min={0} value={form.harga || "0"} onChange={(e) => setForm({ ...form, harga: e.target.value })} /></div>
            <div><label style={lbl}>Stok</label><input style={inp} type="number" min={0} value={form.stok || "0"} onChange={(e) => setForm({ ...form, stok: e.target.value })} /></div>
            <div><label style={lbl}>Stok Min</label><input style={inp} type="number" min={0} value={form.stok_min || "0"} onChange={(e) => setForm({ ...form, stok_min: e.target.value })} /></div>
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
          <thead><tr><th style={th}>Kode</th><th style={th}>Nama</th><th style={th}>Kategori</th><th style={{ ...th, textAlign: "right" }}>Harga</th><th style={{ ...th, textAlign: "right" }}>Stok</th>{canManage && <th style={{ ...th, width: 90 }}>Aksi</th>}</tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td style={td} colSpan={6}>Belum ada produk.</td></tr> :
              rows.map((p, i) => {
                const low = p.kategori !== "TINDAKAN" && Number(p.stok) <= Number(p.stok_min);
                return (
                  <tr key={p.id} style={{ background: i % 2 ? t.bgZebra : "#fff" }}>
                    <td style={td}>{p.kode}</td>
                    <td style={td}>{p.nama}</td>
                    <td style={td}><Badge text={p.kategori} color={KAT_COLOR[p.kategori] ?? t.textSub} /></td>
                    <td style={{ ...td, textAlign: "right" }}>{rupiah(p.harga)}</td>
                    <td style={{ ...td, textAlign: "right", color: low ? t.red : t.text, fontWeight: low ? 700 : 400 }}>
                      {p.kategori === "TINDAKAN" ? "-" : `${Number(p.stok)} ${p.satuan}`}{low ? " ⚠" : ""}
                    </td>
                    {canManage && <td style={td}><Btn icon="✏️" onClick={() => bukaEdit(p)}>Edit</Btn></td>}
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
    </div>
  );
}
