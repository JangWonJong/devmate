import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { tokenStore } from "./token";

export function RequireAuth({ children }: {children: JSX.Element}){
    const loc = useLocation()

    if (!tokenStore.isLoggedIn()){
        return <Navigate to="/login" replace state={{ next: loc.pathname + loc.search + loc.hash}}></Navigate>
    }
    return children

}