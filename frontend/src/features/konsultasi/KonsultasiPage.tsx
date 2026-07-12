import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "../../lib/api";
import type { Kunjungan, Konsultasi, ResepItem, Produk } from "../../lib/types";
import { getAntrian, getDetail, saveKonsultasi, addResep, removeResep, selesaiKonsultasi, getProduk } from "./api";
import { t, Toolbar, Btn, Badge, inp, lbl, th, td, tableStyle, STATUS_COLOR, rupiah } from "../shell/ui";

export default function KonsultasiPage({ user }: { user: AuthUser }) {
  const [antrian, setAntrian] = useState<Kunjungan[]>([]);
  const [sel, setSel] = useState<Kunjungan | null>(null);
  const [loading, setLoading] = useState(true);

  const muat = useCallback(async () => {
    setLoading(true);
    try { setAntrian(await getAntrian()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { muat(); }, [muat]);

  if (sel) return <Detail kunjungan={sel} dokterNama={user.nama} onBack={() => { setSel(null); muat(); }} />;

  return (
    <div>
      <Toolbar>
        <Btn icon="🔄" onClick={muat}>Refresh</Btn>
        <span style={{ marginLeft: "auto", fontSize: 12, color: t.textSub }}>{!loading && `${antrian.length} antrian`}</span>
      </Toolbar>
      {loading ? <p>Memuat...</p> : (
        <table style={tableStyle}>
          <thead><tr><th style={th}>Kode</th><th style={th}>Pasien</th><th style={th}>Jenis Kulit</th><th style={th}>Keluhan</th><th style={th}>Status</th><th style={{ ...th, width: 110 }}></th></tr></thead>
          <tbody>
            {antrian.length === 0 ? <tr><td style={td} colSpan={6}>Tidak ada antrian konsultasi.</td></tr> :
              antrian.map((k, i) => (
                <tr key={k.id} style={{ background: i % 2 ? t.bgZebra : "#fff" }}>
                  <td style={td}>{k.kode}</td>
                  <td style={td}>{k.pasien_nama}<div style={{ fontSize: 11, color: t.textSub }}>{k.no_rm}</div></td>
                  <td style={td}>{k.jenis_kulit || "-"}</td>
                  <td style={td}>{k.keluhan || "-"}</td>
                  <td style={td}><Badge text={k.status} color={STATUS_COLOR[k.status] ?? t.textSub} /></td>
                  <td style={td}><Btn primary icon="🩺" onClick={() => setSel(k)}>Periksa</Btn></td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Detail({ kunjungan, dokterNama, onBack }: { kunjungan: Kunjungan; dokterNama: string; onBack: () => void }) {
  const [kons, setKons] = useState<Konsultasi | null>(null);
  const [items, setItems] = useState<ResepItem[]>([]);
  const [produk, setProduk] = useState<Produk[]>([]);
  const [form, setForm] = useState({ anamnesa: "", diagnosa: "", treatment: "", catatan: "", biaya_konsul: "0" });
  const [resep, setResep] = useState({ produk_id: "", qty: "1", aturan_pakai: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const muat = useCallback(async () => {
    const d = await getDetail(kunjungan.id);
    setKons(d.konsultasi);
    setItems(d.items);
    setForm({
      anamnesa: d.konsultasi.anamnesa || kunjungan.keluhan || "",
      diagnosa: d.konsultasi.diagnosa || "",
      treatment: d.konsultasi.treatment || "",
      catatan: d.konsultasi.catatan || "",
      biaya_konsul: String(Number(d.konsultasi.biaya_konsul) || 0),
    });
  }, [kunjungan.id, kunjungan.keluhan]);

  useEffect(() => { muat(); getProduk().then(setProduk); }, [muat]);

  async function simpan() {
    setError(""); setMsg("");
    try {
      const r = await saveKonsultasi(kunjungan.id, { ...form, dokter: dokterNama, biaya_konsul: form.biaya_konsul as unknown as string });
      setKons(r.konsultasi); setItems(r.items); setMsg("Konsultasi tersimpan ✓");
    } catch (e) { setError((e as Error).message); }
  }

  async function tambahResep() {
    setError("");
    if (!kons) { setError("Simpan konsultasi dulu"); return; }
    if (!resep.produk_id) { setError("Pilih produk"); return; }
    try {
      const it = await addResep(kons.id, { produk_id: Number(resep.produk_id), qty: Number(resep.qty), aturan_pakai: resep.aturan_pakai });
      setItems(it); setResep({ produk_id: "", qty: "1", aturan_pakai: "" });
    } catch (e) { setError((e as Error).message); }
  }

  async function hapusResep(id: number) {
    try { setItems(await removeResep(id)); } catch (e) { setError((e as Error).message); }
  }

  async function selesai() {
    setError("");
    try {
      await simpan();
      const r = await selesaiKonsultasi(kunjungan.id);
      alert(r.status === "FARMASI" ? "Konsultasi selesai → lanjut ke Farmasi (ada resep)" : "Konsultasi selesai (tanpa resep)");
      onBack();
    } catch (e) { setError((e as Error).message); }
  }

  const totalResep = items.reduce((s, it) => s + Number(it.subtotal), 0);

  return (
    <div>
      <Toolbar>
        <Btn icon="←" onClick={onBack}>Kembali</Btn>
        <span style={{ fontWeight: 700, color: t.text }}>{kunjungan.kode} · {kunjungan.pasien_nama} ({kunjungan.no_rm})</span>
        <span style={{ marginLeft: "auto" }}><Badge text={kunjungan.status} color={STATUS_COLOR[kunjungan.status] ?? t.textSub} /></span>
      </Toolbar>

      {/* info pasien */}
      <div style={{ ...card, display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13 }}>
        <span><b>JK:</b> {kunjungan.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}</span>
        <span><b>Jenis Kulit:</b> {kunjungan.jenis_kulit || "-"}</span>
        <span><b>Alergi:</b> <span style={{ color: kunjungan.alergi && kunjungan.alergi !== "Tidak ada" ? t.red : t.text }}>{kunjungan.alergi || "-"}</span></span>
        <span><b>Keluhan:</b> {kunjungan.keluhan || "-"}</span>
      </div>

      {/* form konsultasi */}
      <div style={card}>
        <h3 style={cardH}>Pemeriksaan</h3>
        <div style={{ display: "grid", gap: 10 }}>
          <div><label style={lbl}>Anamnesa (keluhan/riwayat)</label><textarea style={{ ...inp, minHeight: 50 }} value={form.anamnesa} onChange={(e) => setForm({ ...form, anamnesa: e.target.value })} /></div>
          <div><label style={lbl}>Diagnosa *</label><textarea style={{ ...inp, minHeight: 50 }} value={form.diagnosa} onChange={(e) => setForm({ ...form, diagnosa: e.target.value })} /></div>
          <div><label style={lbl}>Treatment / Tindakan</label><textarea style={{ ...inp, minHeight: 50 }} value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} /></div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}><label style={lbl}>Catatan</label><input style={inp} value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} /></div>
            <div style={{ width: 180 }}><label style={lbl}>Biaya Konsultasi (Rp)</label><input style={inp} type="number" min={0} value={form.biaya_konsul} onChange={(e) => setForm({ ...form, biaya_konsul: e.target.value })} /></div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <Btn primary icon="💾" onClick={simpan}>Simpan</Btn>
          {msg && <span style={{ color: t.green, fontSize: 13 }}>{msg}</span>}
        </div>
      </div>

      {/* resep */}
      <div style={card}>
        <h3 style={cardH}>Resep Produk / Obat</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
          <div style={{ flex: 2, minWidth: 220 }}>
            <label style={lbl}>Produk</label>
            <select style={inp} value={resep.produk_id} onChange={(e) => setResep({ ...resep, produk_id: e.target.value })}>
              <option value="">-- pilih produk --</option>
              {produk.map((p) => <option key={p.id} value={p.id}>[{p.kategori}] {p.nama} — {rupiah(p.harga)}</option>)}
            </select>
          </div>
          <div style={{ width: 80 }}><label style={lbl}>Qty</label><input style={inp} type="number" min={1} value={resep.qty} onChange={(e) => setResep({ ...resep, qty: e.target.value })} /></div>
          <div style={{ flex: 1, minWidth: 160 }}><label style={lbl}>Aturan Pakai</label><input style={inp} value={resep.aturan_pakai} onChange={(e) => setResep({ ...resep, aturan_pakai: e.target.value })} placeholder="2x sehari" /></div>
          <Btn icon="➕" onClick={tambahResep}>Tambah</Btn>
        </div>
        <table style={tableStyle}>
          <thead><tr><th style={th}>Produk</th><th style={th}>Aturan</th><th style={{ ...th, textAlign: "right" }}>Qty</th><th style={{ ...th, textAlign: "right" }}>Subtotal</th><th style={{ ...th, width: 40 }}></th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td style={td} colSpan={5}>Belum ada resep.</td></tr> :
              items.map((it, i) => (
                <tr key={it.id} style={{ background: i % 2 ? t.bgZebra : "#fff" }}>
                  <td style={td}>{it.produk_nama}<div style={{ fontSize: 11, color: t.textSub }}>[{it.kategori}]</div></td>
                  <td style={td}>{it.aturan_pakai || "-"}</td>
                  <td style={{ ...td, textAlign: "right" }}>{Number(it.qty)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{rupiah(it.subtotal)}</td>
                  <td style={{ ...td, textAlign: "center" }}>
                    {it.status !== "DISPENSED" && <button onClick={() => hapusResep(it.id)} style={{ border: "none", background: "none", color: t.red, cursor: "pointer", fontSize: 14 }}>✕</button>}
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot><tr style={{ background: t.bgHead }}><td style={{ ...td, fontWeight: 700 }} colSpan={3}>Total Resep</td><td style={{ ...td, textAlign: "right", fontWeight: 700, color: t.primary }}>{rupiah(totalResep)}</td><td style={td}></td></tr></tfoot>
        </table>
      </div>

      {error && <p style={{ color: t.red }}>⚠️ {error}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <Btn accent icon="✅" onClick={selesai}>Selesaikan Konsultasi</Btn>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { border: `1px solid ${t.line}`, borderRadius: 8, padding: 16, marginBottom: 14, background: "#fff" };
const cardH: React.CSSProperties = { margin: "0 0 12px", fontSize: 15, color: t.primaryDark };
