import { Link } from "react-router-dom"
import type { CSSProperties, RefObject } from "react"
import {
  Bell,
  UserCircle2,
  LogOut,
} from "lucide-react"
import type { MeResponse } from "../../api/members"
import {
  getNotificationLabel,
  getNotificationLabelStyle,
  type NotificationResponse,
} from "../../api/notifications"

type AppHeaderProps = {
  isAuthenticated: boolean
  me: MeResponse | null
  meLoading: boolean
  unreadCount: number
  notificationOpen: boolean
  notifications: NotificationResponse[]
  notificationLoading: boolean
  hasUnreadNotifications: boolean
  notificationRef: RefObject<HTMLDivElement | null>
  onToggleNotifications: () => void | Promise<void>
  onReadAllNotifications: () => void | Promise<void>
  onClickNotification: (item: NotificationResponse) => void | Promise<void>
  onLogout: () => void | Promise<void>
  onGuestWriteClick: () => void
  formatNotificationTime: (value: string) => string
}

function NavLinkItem({
  to,
  children,
}: {
  to: string
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
    >
      {children}
    </Link>
  )
}

function GhostButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void | Promise<void>
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm font-medium text-slate-600 transition hover:text-slate-900 ${className}`}
    >
      {children}
    </button>
  )
}

export default function AppHeader({
  isAuthenticated,
  me,
  meLoading,
  unreadCount,
  notificationOpen,
  notifications,
  notificationLoading,
  hasUnreadNotifications,
  notificationRef,
  onToggleNotifications,
  onReadAllNotifications,
  onClickNotification,
  onLogout,
  onGuestWriteClick,
  formatNotificationTime,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            DevMate
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <NavLinkItem to="/posts">커뮤니티</NavLinkItem>

            {isAuthenticated ? (
              <NavLinkItem to="/posts/new">글쓰기</NavLinkItem>
            ) : (
              <GhostButton onClick={onGuestWriteClick}>글쓰기</GhostButton>
            )}

            {isAuthenticated && (
              <NavLinkItem to="/mystudies">내 스터디</NavLinkItem>
            )}

            <NavLinkItem to="/reservations">예약</NavLinkItem>

            {isAuthenticated && <NavLinkItem to="/mypage">마이페이지</NavLinkItem>}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <div ref={notificationRef} className="relative">
              <button
                type="button"
                onClick={() => void onToggleNotifications()}
                className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">알림</span>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1.5 text-center text-[10px] font-bold leading-[18px] text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute left-0 top-[calc(100%+10px)] z-[1000] w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <strong className="text-sm text-slate-900">알림</strong>
                    <button
                       type="button"
                      onClick={() => void onReadAllNotifications()}
                      disabled={!hasUnreadNotifications}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                        hasUnreadNotifications
                          ? "border-slate-300 text-slate-600 hover:bg-slate-50"
                          : "cursor-default border-slate-200 text-slate-400"
                      }`}
                    >
                      전체 읽음
                    </button>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {notificationLoading ? (
                      <div className="px-4 py-4 text-sm text-slate-500">
                        알림 불러오는 중...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm leading-6 text-slate-500">
                        새로운 알림이 없습니다.
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const labelStyle = getNotificationLabelStyle(item.type)

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => void onClickNotification(item)}
                            className={`block w-full border-b border-slate-50 px-4 py-4 text-left transition hover:bg-slate-50 ${
                              item.isRead ? "bg-white" : "bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <span
                                  className="mb-2 inline-flex rounded-full px-2 py-1 text-[11px] font-bold"
                                  style={labelStyle as CSSProperties}
                                >
                                  {getNotificationLabel(item.type)}
                                </span>

                                <div
                                  className={`mb-1.5 text-sm leading-6 ${
                                    item.isRead
                                      ? "font-normal text-slate-600"
                                      : "font-semibold text-slate-900"
                                  }`}
                                >
                                  {item.content}
                                </div>

                                <div className="text-xs text-slate-500">
                                  {formatNotificationTime(item.createdAt)}
                                </div>
                              </div>

                              {!item.isRead && (
                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
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
            <span className="text-sm text-slate-500">사용자 확인 중</span>
          ) : isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 md:flex">
                <UserCircle2 className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  {me?.nickname}님
                </span>
              </div>

              <button
                type="button"
                onClick={() => void onLogout()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                시작하기
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}