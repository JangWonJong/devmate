import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { signup } from "../../api/auth"
import { apiErrorMessage } from "../../utils/error"

const inputClassName =
  "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"

export function SignupPage() {
  const nav = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [nickname, setNickname] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)

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

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview)
      }
    }
  }, [profilePreview])

  const onChangeProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setProfileImageFile(file)
    clearError()

    if (profilePreview) {
      URL.revokeObjectURL(profilePreview)
    }

    if (file) {
      setProfilePreview(URL.createObjectURL(file))
    } else {
      setProfilePreview(null)
    }
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

      await signup(
        {
          email: emailTrim,
          password: passwordTrim,
          confirmPassword: confirmTrim,
          name: nameTrim,
          nickname: nicknameTrim,
          phone: phone.trim() || undefined,
          bio: bio.trim() || undefined,
        },
        profileImageFile
      )

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
          <div className="mt-2 text-center text-sm text-slate-600">
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
            className={inputClassName}
            placeholder="이메일"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearError()
            }}
          />

          <input
            type="password"
            className={inputClassName}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearError()
            }}
          />

          <input
            type="password"
            className={inputClassName}
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              clearError()
            }}
          />

          <input
            className={inputClassName}
            placeholder="이름"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              clearError()
            }}
          />

          <input
            className={inputClassName}
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value)
              clearError()
            }}
          />

          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-700">프로필 사진</div>

            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="프로필 미리보기"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    없음
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={onChangeProfileImage}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
              />
            </div>
          </div>

          <input
            className={inputClassName}
            placeholder="전화번호"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              clearError()
            }}
          />

          <textarea
            className={`${inputClassName} min-h-[110px] resize-y placeholder:text-slate-400`}
            placeholder="한 줄 소개"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value)
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
              disabled={submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "가입 중..." : "회원가입"}
            </button>

            <button
              type="button"
              onClick={() => nav(-1)}
              disabled={submitting}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              뒤로
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}