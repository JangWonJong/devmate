import { tokenStore } from "../api/auth/token"

type JwtPayload = {
  sub?: string
  role?: string
  exp?: number
}

export function parseJwtPayload<T>(token: string): T | null {
  try {
    const base64Payload = token.split(".")[1]
    const normalized = base64Payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = atob(normalized)
    return JSON.parse(decoded) as T
  } catch {
    return null
  }
}

export function getAccessTokenPayload() {
  const accessToken = tokenStore.getAccess()
  if (!accessToken) return null

  return parseJwtPayload<JwtPayload>(accessToken)
}

export function getAccessTokenRole() {
  return getAccessTokenPayload()?.role ?? null
}

export function isAdminUser() {
  return getAccessTokenRole() === "ADMIN"
}