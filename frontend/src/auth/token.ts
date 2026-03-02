const ACCESS_KEY = "devmate_access_token"
const REFRESH_KEY = "devmate_refresh_token"
const AUTH_EVENT = "auth-change"

function emitAuthChange() {
    window.dispatchEvent(new Event(AUTH_EVENT))
}

export const tokenStore = {
    getAccess(): string | null {
        return localStorage.getItem(ACCESS_KEY)
    },
    getRefresh(): string | null {
        return localStorage.getItem(REFRESH_KEY)
    },

    setAccess(token: string){
        localStorage.setItem(ACCESS_KEY, token)
        emitAuthChange()
    },
    setRefresh(token: string){
        localStorage.setItem(REFRESH_KEY, token)
        emitAuthChange()
    },

    setTokens(accessToken: string, refreshToken?: string){
        localStorage.setItem(ACCESS_KEY, accessToken)
        if(refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
        emitAuthChange()
    },

    isLoggedIn(): boolean {
        return !!this.getAccess()
    },

    clear(){
        localStorage.removeItem(ACCESS_KEY)
        localStorage.removeItem(REFRESH_KEY)
        emitAuthChange()
    },

    subscribe(cb: () => void) {
        const onAuthChange = () => cb()
        const onStorage = (e: StorageEvent) => {
            if (e.key === ACCESS_KEY || e.key === REFRESH_KEY) {
                cb()
            }
        }
        window.addEventListener(AUTH_EVENT, onAuthChange)
        window.addEventListener("storage", onStorage)
        return () => {
            window.removeEventListener(AUTH_EVENT, onAuthChange)
            window.removeEventListener("storage", onStorage)
        }
    }
}