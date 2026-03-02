import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { tokenStore } from "./token";

export function RequireAuth({ children }: {children: JSX.Element}){
    const loc = useLocation()

    if (!tokenStore.isLoggedIn()){
        return <Navigate to="/login" replace state={{ from: loc}}></Navigate>
    }
    return children

}