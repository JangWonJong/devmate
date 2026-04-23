import { Navigate, Outlet, useLocation } from "react-router-dom"
import { tokenStore } from "../api/auth/token"
import { isAdminUser } from "../utils/jwt"

export default function AdminRoute() {
  const location = useLocation()
  const accessToken = tokenStore.getAccess()

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!isAdminUser()) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}