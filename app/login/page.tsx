"use client"
import { useState } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError("")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#534AB7", padding: "1.5rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <span style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>Welcome back</span>
      </div>

      <div style={{ padding: "2rem 1.25rem", flex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#534AB7", marginBottom: "8px" }}>Reviu</div>
          <div style={{ fontSize: "14px", color: "#888" }}>Sign in to your account</div>
        </div>

        {error && (
          <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: "#555", display: "block", marginBottom: "6px" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "white", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: "#555", display: "block", marginBottom: "6px" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "white", boxSizing: "border-box" }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </div>

        <div
          onClick={handleLogin}
          style={{ background: loading ? "#9990D9" : "#534AB7", color: "white", padding: "16px", borderRadius: "14px", fontSize: "15px", fontWeight: "600", textAlign: "center", cursor: loading ? "not-allowed" : "pointer", marginBottom: "16px" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </div>

        <div style={{ textAlign: "center", fontSize: "13px", color: "#888" }}>
          {"Don't have an account? "}
          <Link href="/signup" style={{ color: "#534AB7", fontWeight: "600", textDecoration: "none" }}>Sign up free</Link>
        </div>
      </div>
    </main>
  )
}