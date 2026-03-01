import axios from "axios";
import { tokenStore } from "../auth/token";


export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
})

http.interceptors.request.use((config) => {
    const token = tokenStore.getAccess()
    if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`}
    return config
})

let isRefreshing = false
let waiters: Array<(token: string | null) => void> = []

function subscribe(cb: (token: string | null ) => void){
    waiters.push(cb)
}

function notifyAll(token: string | null) {
    waiters.forEach((cb)=> cb(token))
    waiters = []
}

async function requestReissue(): Promise<string> {
    const refreshToken = tokenStore.getRefresh()
    if (!refreshToken) throw new Error("No refresh token")

    const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/reissue`,
        {refreshToken},
        {headers: { "Content-Type":"application/json" }}
    )
    
    if (!data?.success || !data?.data?.accessToken) {
        throw new Error(data?.error?.message ?? "Reissue failed")
    }
    return data.data.accessToken as string
}

function logoutToLogin() {
    tokenStore.clear()
    window.location.href = "/login"
}

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status
    const originalRequest = err?.config

    const url = originalRequest?.url ?? ""
    const isAuthRequest =
      url.includes("/api/auth/login") || url.includes("/api/auth/reissue")

    // 401이 아니거나, auth 요청이면 그대로 실패 처리
    if (status !== 401 && status !== 403 || isAuthRequest) {
      return Promise.reject(err)
    }

    // 무한 루프 방지: 같은 요청을 두 번 이상 재시도하지 않기
    if (originalRequest?._retry) {
      logoutToLogin()
      return Promise.reject(err)
    }
    originalRequest._retry = true

    // refreshToken 없으면 즉시 로그아웃
    if (!tokenStore.getRefresh()) {
      logoutToLogin()
      return Promise.reject(err)
    }

    // 이미 refresh 중이면, 새 토큰 나올 때까지 대기했다가 재시도
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribe((newToken) => {
          if (!newToken) {
            logoutToLogin()
            reject(err)
            return
          }
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          resolve(http(originalRequest))
        })
      })
    }

    // refresh 시작
    isRefreshing = true
    try {
      const newAccessToken = await requestReissue()
      tokenStore.setAccess(newAccessToken)

      // 대기중 요청들 깨우기
      notifyAll(newAccessToken)

      // 본인 요청도 재시도
      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return http(originalRequest)
    } catch (e) {
      // refresh 실패 -> 모두 실패 처리 + 로그아웃
      notifyAll(null)
      logoutToLogin()
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)