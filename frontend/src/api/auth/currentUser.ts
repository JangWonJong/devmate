import { tokenStore } from "./token"

type JwtPayload = {
  memberId?: number
  id?: number
  sub?: string
  role?: string
}

function parsePayload(): JwtPayload | null {
  const token = tokenStore.getAccess()
  if (!token) return null

  try {
    return JSON.parse(atob(token.split(".")[1]))
  } catch {
    return null
  }
}

export function getCurrentMemberId(): number | null {
  const payload = parsePayload()
  if (!payload) return null

  if (payload.memberId != null) return Number(payload.memberId)
  if (payload.id != null) return Number(payload.id)
  if (payload.sub != null) return Number(payload.sub)

  return null
}

export function getCurrentRole(): string | null {
  return parsePayload()?.role ?? null
}