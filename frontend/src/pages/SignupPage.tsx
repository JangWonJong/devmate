import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signup } from "../api/auth"


export function SignupPage() {

  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")

  const [err, setErr] = useState<string | null>(null)
  
  return (
    <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>SIGN UP</h1>
    
          <input
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
           <input
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
            placeholder="nickname"
            type="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}
    
          <button
            style={{ padding: "10px 14px" }}
            onClick={async () => {
              setErr(null);
    
              const e = email.trim()
              const p = password.trim()
              const n = nickname.trim()
              if (!e) return setErr("이메일 입력")
              if (!p) return setErr("비밀번호 입력")
              if (!n) return setErr("닉네임 입력")
    
              try {
                const res = await signup({ email: e, password: p, nickname: n })
                res.email                
                nav("/")
              } catch (e: any) {
                const msg = e.response?.data?.error?.message ?? "회원가입 실패"
                setErr(msg);
    
              }
            }}
          >
            SIGN UP
          </button>
          <button style={{ padding: "10px 14px" }} onClick={() => nav(-1)}>
            뒤로
          </button>
    
        </div>
  )
}