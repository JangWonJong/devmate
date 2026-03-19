import { useCallback, useEffect, useRef, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { tokenStore } from "../auth/token"
import { getMe, type MeResponse } from "../api/members"
import { logout, reissue } from "../api/auth"
import { headerStyle, headerInnerStyle, logoStyle, navStyle, navItemStyle, mainLayoutStyle, secondaryButtonStyle } from "./properties"
import { getUnreadNotificationCount, listNotifications, readAllNotifications, readNotification, getNotificationLabel, getNotificationLabelStyle,
   type NotificationResponse} from "../api/notifications"


export function AppLayout(){
  const nav = useNavigate()
  const loc = useLocation()

  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [me, setMe] = useState<MeResponse | null>(null)
  const [meLoading, setMeLoading] = useState(false)
   
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

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
          hash: loc.hash
        }
      }
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
      nav("/login", {replace: true})
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
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      )
      setUnreadCount(0)
    } catch (e) {
      alert("전체 읽음 처리에 실패했습니다.")
    }
  }

  const handleClickNotification = async (item: NotificationResponse) => {
    try {
      if (!item.isRead) {
        await readNotification(item.id)
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === item.id ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch {
      // 읽음 실패해도 이동은 허용
    } finally {
      setNotificationOpen(false)
      nav(item.targetUrl)
    }
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
      // 1) UI 로그인 상태 반영
      setLoggedIn(tokenStore.isLoggedIn())

      // 2) access 없고 refresh 있으면 access 복구 시도
      if (syncRef.current) return

      const access = tokenStore.getAccess()
      const refresh = tokenStore.getRefresh()
      if (access || !refresh) return

      syncRef.current = true
      try {
        const newAccess = await reissue(refresh)
        if (!alive) return
        tokenStore.setAccess(newAccess) // auth-change 발생 -> 다른 구독자도 반영
      } catch {
        tokenStore.clear()
        if (alive) moveToLogin()
      } finally {
        syncRef.current = false
      }
    }

    // 앱 시작 시 1회
    void onChange()
    const unsub = tokenStore.subscribe(() => void onChange())
    // auth-change + storage 변화 구독
    return () => {
      alive = false
      unsub()
    }
  }, [moveToLogin])

  useEffect(() =>{
    (async () => {
      if (!loggedIn){
        setMe(null)
        setMeLoading(false)
        return
      }
      try {
        setMeLoading(true)
        const m = await getMe()
        setMe(m)
      } catch (e: any) {
        const status = e?.response?.status
        if (status === 401 || status === 403) {
          tokenStore.clear()
          setMe(null)
          return
        }
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

    return (
     <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <header style={headerStyle}>
        <div style={headerInnerStyle}>
          <Link to="/" style={logoStyle}>
            DevMate
          </Link>

          <nav style={navStyle}>
            {isAuthenticated ? (
              <Link to="/posts/new" style={navItemStyle}>
                글쓰기
              </Link>
            ) : (
              <button
                type="button"
                style={navItemStyle}
                onClick={() => {
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
                }}
              >
                글쓰기
              </button>
            )}

            {isAuthenticated && (
              <Link to="/mystudies" style={navItemStyle}>
                내 스터디
              </Link>
            )}

            <Link to="/reservations" style={navItemStyle}>
              예약
            </Link>

            {isAuthenticated && (
              <Link to="/mypage" style={navItemStyle}>
                마이페이지
              </Link>
              
            )}
            {isAuthenticated && (
              <div ref={notificationRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => void handleToggleNotifications()}
                  style={{
                    ...navItemStyle,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  알림
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -10,
                        right: -12,
                        minWidth: 16,
                        height: 16,
                        padding: "0 4px",
                        borderRadius: 999,
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: 10,
                        lineHeight: "18px",
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 10px)",
                      left: 0,
                      width: 400,
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                      overflow: "hidden",
                      zIndex: 1000,
                    }}
                  > 
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 16px",
                        borderBottom: "1px solid #f1f5f9",
                        background: "#fcfcfd",
                      }}
                    >
                      <strong style={{ fontSize: 15, color: "#111827" }}>알림</strong>
                      <button
                        type="button"
                        onClick={() => void handleReadAllNotifications()}
                        disabled={!hasUnreadNotifications}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: hasUnreadNotifications ? "#2563eb" : "#9ca3af",
                          fontSize: 12,
                          cursor: hasUnreadNotifications ? "pointer" : "default",
                          fontWeight: 600,
                          textDecoration: hasUnreadNotifications ? "underline" : "none",
                          textUnderlineOffset: 2,
                        }}
                      >
                        모두 읽음 처리
                      </button>
                    </div>

                    <div style={{ maxHeight: 420, overflowY: "auto" }}>
                      {notificationLoading ? (
                        <div style={{ padding: 16, fontSize: 13, color: "#666" }}>
                          알림 불러오는 중...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div style={{ padding: 24, fontSize: 13, color: "#666", lineHeight: 1.6, textAlign: "center" }}>
                          새로운 알림이 없습니다.
                        </div>
                      ) : (
                        notifications.map((item) => {
                        const labelStyle = getNotificationLabelStyle(item.type)

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => void handleClickNotification(item)}
                            style={{
                              width: "100%",
                              display: "block",
                              textAlign: "left",
                              border: "none",
                              borderBottom: "1px solid #f8fafc",
                              background: item.isRead ? "#fff" : "#f8fafc",
                              padding: "14px 16px",
                              cursor: "pointer",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = item.isRead ? "#f9fafb" : "#f1f5f9"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = item.isRead ? "#fff" : "#f8fafc"
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: 12,
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "4px 8px",
                                    borderRadius: 999,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    marginBottom: 8,
                                    ...labelStyle,
                                  }}
                                >
                                  {getNotificationLabel(item.type)}
                                </div>

                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: item.isRead ? 400 : 700,
                                    color: item.isRead ? "#4b5563" : "#111827",
                                    marginBottom: 6,
                                    lineHeight: 1.45,
                                  }}
                                >
                                  {item.content}
                                </div>

                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#6b7280",
                                  }}
                                >
                                  {formatNotificationTime(item.createdAt)}
                                </div>
                              </div>

                              {!item.isRead && (
                                <span
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 999,
                                    background: "#2563eb",
                                    marginTop: 10,
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                            </div>
                          </button>
                        )
                      })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {meLoading ? (
              <span style={{ fontSize: 13, color: "#666" }}>사용자 확인 중</span>
            ) : isAuthenticated ? (
              <>
                <span style={{ fontSize: 13, color: "#666" }}>
                  {me.nickname}님 ({me.email})
                </span>
                <button
                  style={{ ...secondaryButtonStyle, padding: "6px 10px" }}
                  onClick={onLogout}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={navItemStyle}>
                  로그인
                </Link>
                <Link to="/signup" style={navItemStyle}>
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={mainLayoutStyle}>
        <Outlet />
      </main>
    </div>
  )
}