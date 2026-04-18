import { Navigate, Outlet, useLocation } from "react-router-dom"
import { tokenStore } from "../auth/token"

type JwtPayload = {
  sub?: string
  role?: string
  exp?: number
}

function parseJwtPayload<T>(token: string): T | null {
  try {
    const payload = token.split(".")[1]
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = atob(normalized)
    return JSON.parse(decoded) as T
  } catch {
    return null
  }
}

export default function AdminRoute() {
  const location = useLocation()
  const accessToken = tokenStore.getAccess()

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const payload = parseJwtPayload<JwtPayload>(accessToken)

  if (payload?.role !== "ADMIN") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}