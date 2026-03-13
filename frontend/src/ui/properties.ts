import type { CSSProperties } from "react"

export const pageStyle: CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "24px 16px 48px",
}

export const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #ececec",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
}

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 12,
  fontSize: 14,
  boxSizing: "border-box",
}

export const primaryButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
}

export const secondaryButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  color: "#111",
  cursor: "pointer",
  fontWeight: 600,
}

export const errorBoxStyle: CSSProperties = {
  marginBottom: 16,
  padding: "12px 14px",
  borderRadius: 12,
  background: "#fff5f5",
  border: "1px solid #ffd6d6",
  color: "crimson",
}

export const mutedBoxStyle: CSSProperties = {
  padding: "10px 12px",
  background: "#fafafa",
  border: "1px solid #eee",
  borderRadius: 12,
  color: "#555",
  fontSize: 14,
}

export const slotButtonBaseStyle: CSSProperties = {
  padding: "14px 12px",
  borderRadius: 16,
  fontWeight: 600,
}

export const listItemCardStyle: CSSProperties = {
  padding: 14,
  border: "1px solid #eee",
  borderRadius: 16,
  background: "#fff",
}

export function getSlotButtonStyle(unavailable: boolean, selected: boolean): React.CSSProperties {
  return {
    ...slotButtonBaseStyle,
    border: unavailable
      ? "1px solid #e5e5e5"
      : selected
      ? "1px solid #111"
      : "1px solid #ddd",
    background: unavailable ? "#f3f3f3" : selected ? "#111" : "#fff",
    color: unavailable ? "#aaa" : selected ? "#fff" : "#111",
    cursor: unavailable ? "not-allowed" : "pointer",
  }
}