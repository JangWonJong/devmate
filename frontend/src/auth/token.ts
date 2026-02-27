const ACCESS_KEY = "devmate_access_token"
const REFRESH_KEY = "devmate_refresh_token"

export const tokenStore = {
    getAccess(): string | null {
        return localStorage.getItem(ACCESS_KEY)
    },
    getRefresh(): string | null {
        return localStorage.getItem(REFRESH_KEY)
    },

    setAccess(token: string){
        localStorage.setItem(ACCESS_KEY, token)
    },
    setRefresh(token: string){
        localStorage.setItem(REFRESH_KEY, token)
    },

    setTokens(accessToken: string, refreshToken?: string){
        this.setAccess(accessToken)
        if(refreshToken) this.setRefresh(refreshToken)
    },

    isLoggedIn(): boolean {
        return !!this.getAccess()
    },

    clear(){
        localStorage.removeItem(ACCESS_KEY)
        localStorage.removeItem(REFRESH_KEY)
    }
}