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

/* 추가 */
export const headerStyle: CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "12px 16px",
  background: "#fff",
}

export const headerInnerStyle: CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
}

export const logoStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: 20,
  textDecoration: "none",
  color: "#111",
  whiteSpace: "nowrap",
}

export const navStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  flexWrap: "wrap",
}

export const navItemStyle: CSSProperties = {
  color: "#4c57ff",
  textDecoration: "none",
  fontSize: 16,
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  font: "inherit",
}

export const mainLayoutStyle: CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "16px",
}

export const titleHeroStyle: CSSProperties = {
  fontSize: 56,
  fontWeight: 800,
  margin: 0,
  marginBottom: 12,
  color: "#24364b",
  letterSpacing: -1,
}

export const authPageWrapStyle: CSSProperties = {
  minHeight: "calc(100vh - 80px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 16px",
}

export const authFormStyle: CSSProperties = {
  width: "100%",
  maxWidth: 420,
  display: "flex",
  flexDirection: "column",
  gap: 12,
}

export const authButtonRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 6,
}

export const sectionStyle: React.CSSProperties = {
  ...cardStyle,
  display: "grid",
  gap: 12,
  marginBottom: 24,
}

export const buttonStyle: React.CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #ddd",
  borderRadius: 10,
  background: "#fff",
  fontWeight: 700,
  cursor: "pointer",
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

export function getReservationStatusStyle(status: string) {
  if (status === "오늘 예약") {
    return {
      background: "#eef6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    }
  }

  if (status === "지난 예약") {
    return {
      background: "#f5f5f5",
      color: "#777",
      border: "1px solid #e5e5e5",
    }
  }

  return {
    background: "#f0fdf4",
    color: "#15803d",
    border: "1px solid #bbf7d0",
  }
}

