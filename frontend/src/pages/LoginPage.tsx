import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { tokenStore } from "../auth/token";


export function LoginPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState<string | null>(null)
  
  return <div style={{ maxWidth: 420 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>LOGIN</h1>

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

      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}

      <button
        style={{ padding: "10px 14px" }}
        onClick={async () => {
          setErr(null);
          try {
            const res = await login({ email, password });
            tokenStore.setAccess(res.accessToken);
            nav("/");
          } catch (e: any) {
            setErr(e.message ?? "로그인 실패");
          }
        }}
      >
        LOGIN
      </button>
    </div>
}