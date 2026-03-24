import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signup } from "../../api/auth"
import { apiErrorMessage } from "../../utils/error"

export function SignupPage() {
  const nav = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [nickname, setNickname] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const emailTrim = email.trim()
  const passwordTrim = password.trim()
  const confirmTrim = confirmPassword.trim()
  const nameTrim = name.trim()
  const nicknameTrim = nickname.trim()

  const clearError = () => {
    if (err) setErr(null)
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return

    setErr(null)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailTrim) return setErr("이메일을 입력해주세요")
    if (!emailRegex.test(emailTrim)) {
      return setErr("올바른 이메일 형식을 입력해주세요")
    }
    if (!passwordTrim) return setErr("비밀번호를 입력해주세요")
    if (passwordTrim.length < 8) {
      return setErr("비밀번호는 8자 이상이어야 합니다")
    }
    if (!confirmTrim) return setErr("비밀번호 확인을 입력해주세요")
    if (passwordTrim !== confirmTrim) {
      return setErr("비밀번호가 일치하지 않습니다")
    }
    if (!nameTrim) return setErr("이름을 입력해주세요")
    if (!nicknameTrim) return setErr("닉네임을 입력해주세요")

    try {
      setSubmitting(true)

      await signup({
        email: emailTrim,
        password: passwordTrim,
        confirmPassword: confirmTrim,
        name: nameTrim,
        nickname: nicknameTrim,
      })

      nav("/login", { state: { signupSuccess: true } })
    } catch (e: any) {
      setErr(apiErrorMessage(e, "회원가입에 실패했습니다"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="mt-2 text-3xl font-bold text-slate-900">회원가입</h1>
          <p className="mt-2 text-sm text-slate-600">
            DevMate에 가입하고 커뮤니티, 스터디, 예약 기능을 시작해보세요.
          </p>
          <div className="text-center text-sm text-slate-600">
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              onClick={() => nav("/login")}
              className="font-medium text-indigo-600 hover:underline"
            >
              로그인
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSignup}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
        >
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="이메일"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearError()
            }}
          />

          <input
            type="password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearError()
            }}
          />

          <input
            type="password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              clearError()
            }}
          />

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="이름"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              clearError()
            }}
          />

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value)
              clearError()
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
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {submitting ? "가입 중..." : "회원가입"}
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