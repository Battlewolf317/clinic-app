import { useState, useEffect, useCallback } from "react";
import type { Kunjungan } from "../../lib/types";
import { getAntrian, getDetail, dispense, selesai, type FarmasiDetail } from "./api";
import { t, Toolbar, Btn, Badge, th, td, tableStyle, rupiah } from "../shell/ui";

export default function FarmasiPage({ role }: { role: string }) {
  const canManage = role === "farmasi" || role === "admin";
  const [antrian, setAntrian] = useState<Kunjungan[]>([]);
  const [sel, setSel] = useState<Kunjungan | null>(null);
  const [loading, setLoading] = useState(true);

  const muat = useCallback(async () => {
    setLoading(true);
    try { setAntrian(await getAntrian()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { muat(); }, [muat]);

  if (sel) return <Detail kunjungan={sel} canManage={canManage} onBack={() => { setSel(null); muat(); }} />;

  return (
    <div>
      <Toolbar>
        <Btn icon="🔄" onClick={muat}>Refresh</Btn>
        <span style={{ marginLeft: "auto", fontSize: 12, color: t.textSub }}>{!loading && `${antrian.length} antrian farmasi`}</span>
      </Toolbar>
      {loading ? <p>Memuat...</p> : (
        <table style={tableStyle}>
          <thead><tr><th style={th}>Kode</th><th style={th}>Pasien</th><th style={{ ...th, width: 110 }}></th></tr></thead>
          <tbody>
            {antrian.length === 0 ? <tr><td style={td} colSpan={3}>Tidak ada antrian farmasi.</td></tr> :
              antrian.map((k, i) => (
                <tr key={k.id} style={{ background: i % 2 ? t.bgZebra : "#fff" }}>
                  <td style={td}>{k.kode}</td>
                  <td style={td}>{k.pasien_nama}<div style={{ fontSize: 11, color: t.textSub }}>{k.no_rm}</div></td>
                  <td style={td}><Btn primary icon="💊" onClick={() => setSel(k)}>Proses</Btn></td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Detail({ kunjungan, canManage, onBack }: { kunjungan: Kunjungan; canManage: boolean; onBack: () => void }) {
  const [data, setData] = useState<FarmasiDetail | null>(null);
  const [error, setError] = useState("");

  const muat = useCallback(async () => { setData(await getDetail(kunjungan.id)); }, [kunjungan.id]);
  useEffect(() => { muat(); }, [muat]);

  async function dispenseItem(id: number) {
    setError("");
    try { await dispense(id); muat(); } catch (e) { setError((e as Error).message); }
  }
  async function selesaikan() {
    setError("");
    try { await selesai(kunjungan.id); alert("Farmasi selesai — kunjungan SELESAI ✓"); onBack(); }
    catch (e) { setError((e as Error).message); }
  }

  if (!data) return <p>Memuat...</p>;
  const semuaDispensed = data.items.length > 0 && data.items.every((it) => it.status === "DISPENSED");

  return (
    <div>
      <Toolbar>
        <Btn icon="←" onClick={onBack}>Kembali</Btn>
        <span style={{ fontWeight: 700, color: t.text }}>{kunjungan.kode} · {kunjungan.pasien_nama} ({kunjungan.no_rm})</span>
      </Toolbar>

      {data.konsultasi && (
        <div style={{ ...card, fontSize: 13 }}>
          <div><b>Diagnosa:</b> {data.konsultasi.diagnosa || "-"}</div>
          <div><b>Treatment:</b> {data.konsultasi.treatment || "-"}</div>
        </div>
      )}

      <div style={card}>
        <h3 style={cardH}>Resep — Dispensing</h3>
        <table style={tableStyle}>
          <thead><tr><th style={th}>Produk</th><th style={th}>Aturan</th><th style={{ ...th, textAlign: "right" }}>Qty</th><th style={{ ...th, textAlign: "right" }}>Stok</th><th style={{ ...th, textAlign: "right" }}>Subtotal</th><th style={th}>Status</th>{canManage && <th style={{ ...th, width: 110 }}></th>}</tr></thead>
          <tbody>
            {data.items.length === 0 ? <tr><td style={td} colSpan={7}>Tidak ada resep.</td></tr> :
              data.items.map((it, i) => (
                <tr key={it.id} style={{ background: i % 2 ? t.bgZebra : "#fff" }}>
                  <td style={td}>{it.produk_nama}<div style={{ fontSize: 11, color: t.textSub }}>[{it.kategori}]</div></td>
                  <td style={td}>{it.aturan_pakai || "-"}</td>
                  <td style={{ ...td, textAlign: "right" }}>{Number(it.qty)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{it.kategori === "TINDAKAN" ? "-" : Number(it.stok_tersedia)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{rupiah(it.subtotal)}</td>
                  <td style={td}><Badge text={it.status} color={it.status === "DISPENSED" ? t.green : t.amber} /></td>
                  {canManage && <td style={td}>{it.status !== "DISPENSED" && <Btn primary icon="✓" onClick={() => dispenseItem(it.id)}>Serahkan</Btn>}</td>}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ringkasan biaya */}
      <div style={{ ...card, maxWidth: 360 }}>
        <h3 style={cardH}>Ringkasan Biaya</h3>
        <Row label="Biaya Konsultasi" value={rupiah(data.ringkasan.biaya_konsul)} />
        <Row label="Total Produk/Obat" value={rupiah(data.ringkasan.total_produk)} />
        <div style={{ borderTop: `1px solid ${t.line}`, marginTop: 6, paddingTop: 6 }}>
          <Row label="TOTAL" value={rupiah(data.ringkasan.total)} bold />
        </div>
      </div>

      {error && <p style={{ color: t.red }}>⚠️ {error}</p>}
      {canManage && <Btn accent icon="✅" onClick={selesaikan} disabled={!semuaDispensed}>Selesaikan (Serahkan Semua)</Btn>}
      {!semuaDispensed && data.items.length > 0 && <p style={{ fontSize: 12, color: t.textSub }}>Serahkan semua item dulu untuk menyelesaikan.</p>}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 14, fontWeight: bold ? 700 : 400, color: bold ? t.primary : t.text }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

const card: React.CSSProperties = { border: `1px solid ${t.line}`, borderRadius: 8, padding: 16, marginBottom: 14, background: "#fff" };
const cardH: React.CSSProperties = { margin: "0 0 12px", fontSize: 15, color: t.primaryDark };
