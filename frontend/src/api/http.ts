import axios from "axios"
import { tokenStore } from "./auth/token"
import { appToast } from "../lib/toast"

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

http.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let isRefreshing = false
let waiters: Array<(token: string | null) => void> = []

function subscribe(cb: (token: string | null) => void) {
  waiters.push(cb)
}

function notifyAll(token: string | null) {
  waiters.forEach((cb) => cb(token))
  waiters = []
}

async function requestReissue(): Promise<string> {
  const refreshToken = tokenStore.getRefresh()
  if (!refreshToken) throw new Error("No refresh token")

  const { data } = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/auth/reissue`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
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

function isAccountBlockedError(errorCode?: string) {
  return errorCode === "AUTH_401_6" || errorCode === "AUTH_401_5"
}

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status
    const errorCode = err?.response?.data?.error?.code
    const errorMessage = err?.response?.data?.error?.message

    const originalRequest = err?.config
    const url = originalRequest?.url ?? ""
    const method = (originalRequest?.method ?? "").toUpperCase()

    const isAuthRequest =
      url.includes("/api/auth/login") || url.includes("/api/auth/reissue")

    if (isAuthRequest) {
      return Promise.reject(err)
    }

    if (isAccountBlockedError(errorCode)) {
      appToast.error(errorMessage ?? "계정 상태를 확인해주세요.")
      logoutToLogin()
      return Promise.reject(err)
    }

    const isPublicGet =
      method === 'GET' &&
      (url.startsWith('/api/members') ||
        url.startsWith('/api/posts') ||
        url.startsWith('/api/studies') ||
        url.startsWith('/api/reservation-spaces') ||
        url.startsWith('/api/reservations'))

    if (status !== 401 && status !== 403) {
      return Promise.reject(err)
    }

    if (isPublicGet && !tokenStore.getRefresh()) {
      return Promise.reject(err)
    }

    if (originalRequest?._retry) {
      if (!isPublicGet) {
        logoutToLogin()
      }

      return Promise.reject(err)
    }

    originalRequest._retry = true

    if (!tokenStore.getRefresh()) {
      if (!isPublicGet) {
        logoutToLogin()
      }

      return Promise.reject(err)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribe((newToken) => {
          if (!newToken) {
            if (!isPublicGet) {
              logoutToLogin()
            }

            reject(err)
            return
          }

          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`

          resolve(http(originalRequest))
        })
      })
    }

    isRefreshing = true

    try {
      const newAccessToken = await requestReissue()
      tokenStore.setAccess(newAccessToken)

      notifyAll(newAccessToken)

      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      return http(originalRequest)
    } catch (e: any) {
      notifyAll(null)

      const reissueErrorCode = e?.response?.data?.error?.code
      const reissueErrorMessage = e?.response?.data?.error?.message

      if (isAccountBlockedError(reissueErrorCode)) {
        appToast.error(reissueErrorMessage ?? "계정 상태를 확인해주세요.")
        logoutToLogin()
        return Promise.reject(e)
      }

      if (!isPublicGet) {
        logoutToLogin()
      }

      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)