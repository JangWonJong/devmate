import type React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { tokenStore } from "./token"


type Props = {
    children: React.ReactNode
}

export function PublicOnlyRoute({ children }: Props) {
    const loc = useLocation()

    if (tokenStore.isLoggedIn()) {
        return <Navigate to="/" replace state={{ from: loc }} />
    }

    return children
}