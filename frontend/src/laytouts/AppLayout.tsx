import { useCallback, useEffect, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { tokenStore } from "../auth/token"
import { getMe, type MeResponse } from "../api/members"
import { logout, reissue } from "../api/auth"
import AppHeader from "../components/common/AppHeader"
import {
  getUnreadNotificationCount,
  listNotifications,
  readAllNotifications,
  readNotification,
  type NotificationResponse,
} from "../api/notifications"
import SupportFloatingButton from "../components/support/SupportFloatingButton"
import SupportPanel from "../components/support/SupportPanel"

export function AppLayout() {
  const nav = useNavigate()
  const loc = useLocation()

  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [me, setMe] = useState<MeResponse | null>(null)
  const [meLoading, setMeLoading] = useState(false)

  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const [supportOpen, setSupportOpen] = useState(false)

  const notificationRef = useRef<HTMLDivElement | null>(null)
  const syncRef = useRef(false)

  const isAuthenticated = me != null
  const hasUnreadNotifications = notifications.some((item) => !item.isRead)

  const moveToLogin = useCallback(() => {
    if (loc.pathname === "/login" || loc.pathname === "/signup") return

    nav("/login", {
      replace: true,
      state: {
        from: {
          pathname: loc.pathname,
          search: loc.search,
          hash: loc.hash,
        },
      },
    })
  }, [loc.pathname, loc.search, loc.hash, nav])

  const onLogout = async () => {
    try {
      await logout()
    } finally {
      tokenStore.clear()
      setUnreadCount(0)
      setNotifications([])
      setNotificationOpen(false)
      nav("/login", { replace: true })
    }
  }

  const loadUnreadCount = useCallback(async () => {
    if (!tokenStore.isLoggedIn()) {
      setUnreadCount(0)
      return
    }

    try {
      const res = await getUnreadNotificationCount()
      setUnreadCount(res.unreadCount)
    } catch {
      setUnreadCount(0)
    }
  }, [])

  const loadNotifications = useCallback(async () => {
    if (!tokenStore.isLoggedIn()) {
      setNotifications([])
      return
    }

    try {
      setNotificationLoading(true)
      const page = await listNotifications(0, 10)
      setNotifications(page.content)
    } catch {
      setNotifications([])
    } finally {
      setNotificationLoading(false)
    }
  }, [])

  const handleToggleNotifications = async () => {
    const next = !notificationOpen
    setNotificationOpen(next)

    if (next) {
      await loadNotifications()
      await loadUnreadCount()
    }
  }

  const handleReadAllNotifications = async () => {
    try {
      await readAllNotifications()
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
      setUnreadCount(0)
    } catch {
      alert("전체 읽음 처리에 실패했습니다.")
    }
  }

  const handleClickNotification = async (item: NotificationResponse) => {
    try {
      if (!item.isRead) {
        await readNotification(item.id)

        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        )

        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setNotificationOpen(false)
      nav(item.targetUrl)
    }
  }

  const handleGuestWriteClick = () => {
    alert("로그인 후 게시글 작성이 가능합니다.")
    nav("/login", {
      state: {
        from: {
          pathname: loc.pathname,
          search: loc.search,
          hash: loc.hash,
        },
      },
    })
  }

  const formatNotificationTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 1000 / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffMin < 1) return "방금 전"
    if (diffMin < 60) return `${diffMin}분 전`
    if (diffHour < 24) return `${diffHour}시간 전`
    if (diffDay < 7) return `${diffDay}일 전`

    return date.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  useEffect(() => {
    let alive = true

    const onChange = async () => {
      if (!alive) return
      setLoggedIn(tokenStore.isLoggedIn())

      if (syncRef.current) return

      const access = tokenStore.getAccess()
      const refresh = tokenStore.getRefresh()
      if (access || !refresh) return

      syncRef.current = true
      try {
        const newAccess = await reissue(refresh)
        if (!alive) return
        tokenStore.setAccess(newAccess)
      } catch {
        tokenStore.clear()
        if (alive) moveToLogin()
      } finally {
        syncRef.current = false
      }
    }

    void onChange()
    const unsub = tokenStore.subscribe(() => void onChange())

    return () => {
      alive = false
      unsub()
    }
  }, [moveToLogin])

  useEffect(() => {
    ;(async () => {
      if (!loggedIn) {
        setMe(null)
        setMeLoading(false)
        return
      }

      try {
        setMeLoading(true)
        const m = await getMe()
        setMe(m)
      } catch {
        tokenStore.clear()
        setMe(null)
      } finally {
        setMeLoading(false)
      }
    })()
  }, [loggedIn])

  useEffect(() => {
    if (!isAuthenticated) return

    if (loc.pathname === "/login" || loc.pathname === "/signup") {
      nav("/", { replace: true })
    }
  }, [isAuthenticated, loc.pathname, nav])

  useEffect(() => {
    if (!loggedIn) {
      setUnreadCount(0)
      setNotifications([])
      setNotificationOpen(false)
      return
    }

    void loadUnreadCount()
  }, [loggedIn, loadUnreadCount])

  useEffect(() => {
    if (!notificationOpen) return

    const onClickOutside = (e: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setNotificationOpen(false)
      }
    }

    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [notificationOpen])


  useEffect(() => {
    if (!loggedIn) return

    const token = tokenStore.getAccess()
    if (!token) return

    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_BASE_URL}/api/notifications/subscribe?token=${encodeURIComponent(token)}`
    )

    eventSource.onmessage = () => {
      void loadUnreadCount()
      if (notificationOpen) {
        void loadNotifications()
      }
    }

    eventSource.onerror = (e) => {
      console.error("SSE connection error", e)
    }

    return () => {
      eventSource.close()
    }
  }, [loggedIn, loadUnreadCount])

  useEffect(() => {
    if (!loggedIn) return

    const handleFocus = () => {
      void loadUnreadCount()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [loggedIn, loadUnreadCount])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AppHeader
        isAuthenticated={isAuthenticated}
        me={me}
        meLoading={meLoading}
        unreadCount={unreadCount}
        notificationOpen={notificationOpen}
        notifications={notifications}
        notificationLoading={notificationLoading}
        hasUnreadNotifications={hasUnreadNotifications}
        notificationRef={notificationRef}
        onToggleNotifications={handleToggleNotifications}
        onReadAllNotifications={handleReadAllNotifications}
        onClickNotification={handleClickNotification}
        onLogout={onLogout}
        onGuestWriteClick={handleGuestWriteClick}
        formatNotificationTime={formatNotificationTime}
      />

      <main className="mx-auto min-h-[calc(100vh-64px)] max-w-7xl px-6 py-10">
        <Outlet />
      </main>
       <SupportFloatingButton
          open={supportOpen}
          onClick={() => setSupportOpen((prev) => !prev)}
        />
        <SupportPanel open={supportOpen} onClose={() => setSupportOpen(false)} />

    </div>
  )
}