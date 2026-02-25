const ACCESS_KEY = "devmate_access_token"

export const tokenStore = {
    getAccess(): string | null {
        return localStorage.getItem(ACCESS_KEY)
    },
    setAccess(token: string){
        localStorage.setItem(ACCESS_KEY, token)
    },
    clear(){
        localStorage.removeItem(ACCESS_KEY)
    }
}