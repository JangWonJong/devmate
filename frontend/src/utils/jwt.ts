

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