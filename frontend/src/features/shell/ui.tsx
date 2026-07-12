// =====================================================================
// ui.tsx — tema & komponen UI reusable (gaya klinik: teal + rose, lembut)
// =====================================================================

import type { CSSProperties, ReactNode } from "react";

export const t = {
  primary: "#0d9488",     // teal
  primaryDark: "#0f766e",
  accent: "#ec4899",      // rose/pink (skincare vibe)
  line: "#e2e8f0",
  bgHead: "#f1f5f9",
  bgZebra: "#f8fafc",
  text: "#1e293b",
  textSub: "#64748b",
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626",
  blue: "#2563eb",
  white: "#ffffff",
};

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 10px", background: t.bgHead, border: `1px solid ${t.line}`, borderRadius: 8, marginBottom: 12, alignItems: "center" }}>
      {children}
    </div>
  );
}

type BtnProps = { icon?: string; children: ReactNode; onClick?: () => void; primary?: boolean; accent?: boolean; danger?: boolean; type?: "button" | "submit"; disabled?: boolean };
export function Btn({ icon, children, onClick, primary, accent, danger, type = "button", disabled }: BtnProps) {
  const bg = primary ? t.primary : accent ? t.accent : "#fff";
  const fg = primary || accent ? "#fff" : danger ? t.red : t.text;
  const style: CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 13px", fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer", borderRadius: 6,
    border: `1px solid ${primary ? t.primary : accent ? t.accent : t.line}`,
    background: bg, color: fg, opacity: disabled ? 0.5 : 1, fontWeight: primary || accent ? 600 : 400,
  };
  return (<button type={type} onClick={onClick} disabled={disabled} style={style}>{icon && <span>{icon}</span>}{children}</button>);
}

export function Badge({ text, color }: { text: string; color: string }) {
  return (<span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 12, fontSize: 11, fontWeight: 700, color: "#fff", background: color }}>{text}</span>);
}

export const th: CSSProperties = { padding: "8px 10px", textAlign: "left", background: t.bgHead, borderBottom: `1px solid ${t.line}`, fontSize: 12, fontWeight: 700, color: t.textSub, textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap" };
export const td: CSSProperties = { padding: "8px 10px", borderBottom: `1px solid ${t.line}`, fontSize: 13, color: t.text };
export const tableStyle: CSSProperties = { borderCollapse: "collapse", width: "100%", border: `1px solid ${t.line}`, borderRadius: 8, overflow: "hidden" };
export const inp: CSSProperties = { padding: "8px 10px", width: "100%", boxSizing: "border-box", border: `1px solid ${t.line}`, borderRadius: 6, fontSize: 13 };
export const lbl: CSSProperties = { fontSize: 12, color: t.textSub, display: "block", marginBottom: 3, fontWeight: 600 };

export const STATUS_COLOR: Record<string, string> = {
  DAFTAR: t.blue, KONSULTASI: t.amber, FARMASI: t.accent, SELESAI: t.green, BATAL: t.textSub,
};

export const rupiah = (n: number | string) => "Rp " + Number(n || 0).toLocaleString("id-ID");
