import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { tokenStore } from "../../auth/token";
import { apiErrorMessage } from "../../utils/error";


export function LoginPage() {
  const nav = useNavigate()
  const loc = useLocation()

  const from =
    (loc.state as any)?.from?.pathname
      ? (loc.state as any).from.pathname +
        ((loc.state as any).from.search ?? "") +
        ((loc.state as any).from.hash ?? "")
      : "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const signupSuccess = Boolean((loc.state as any)?.signupSuccess)
  const withdrawSuccess = Boolean((loc.state as any)?.withdrawSuccess)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return

    setErr(null)

    if (!email.trim()) return setErr("이메일을 입력해주세요")
    if (!password.trim()) return setErr("비밀번호를 입력해주세요")

    try {
      setSubmitting(true)
      const res = await login({ email: email.trim(), password: password.trim() })
      tokenStore.setTokens(res.accessToken, res.refreshToken)
      nav(from, { replace: true })
    } catch (e: any) {
      setErr(apiErrorMessage(e, "로그인 실패"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* 제목 */}
        <div className="mb-8 text-center">
          <h1 className="mt-2 text-3xl font-bold text-slate-900">로그인</h1>
          <p className="mt-2 text-sm text-slate-600">
            DevMine에 로그인하고 서비스를 이용해보세요.
          </p>
          <div className="text-center text-sm text-slate-600">
          계정이 없으신가요?{" "}
          <button
            type="button"
            onClick={() => nav("/signup")}
            className="font-medium text-indigo-600 hover:underline"
          >
            회원가입
          </button>
        </div>
        </div>

        {/* 카드 */}
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
        >
          {signupSuccess && !err && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
              회원가입이 완료되었습니다. 로그인 해주세요.
            </div>
          )}

          {withdrawSuccess && !err && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              회원 탈퇴가 완료되었습니다.
            </div>
          )}

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="이메일"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (err) setErr(null)
            }}
          />

          <input
            type="password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (err) setErr(null)
            }}
          />

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {err}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              {submitting ? "로그인 중..." : "로그인"}
            </button>

            <button
              type="button"
              onClick={() => nav(-1)}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              뒤로
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}