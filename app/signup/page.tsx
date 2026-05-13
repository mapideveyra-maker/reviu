"use client"
import { useState } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [type, setType] = useState("reviewer")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSignup() {
    setLoading(true)
    setError("")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, account_type: type } }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <div style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>Welcome to Reviu!</div>
          <div style={{ fontSize: "14px", color: "#888", marginBottom: "24px", lineHeight: "1.6" }}>
            Check your email to confirm your account. Once confirmed you can sign in and start reviewing.
          </div>
          <Link href="/login" style={{ display: "block", background: "#534AB7", color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", textDecoration: "none" }}>
            Go to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#534AB7", padding: "1.5rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <span style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>Create account</span>
      </div>

      <div style={{ padding: "2rem 1.25rem", flex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#534AB7", marginBottom: "8px" }}>Reviu</div>
          <div style={{ fontSize: "14px", color: "#888" }}>Join the fairest review platform</div>
        </div>

        {error && (
          <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: "#555", display: "block", marginBottom: "6px" }}>Full name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "white", boxSizing: "border-box" }}
          />
        </div>

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

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: "#555", display: "block", marginBottom: "6px" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "white", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: "#555", display: "block", marginBottom: "8px" }}>I am joining as</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { value: "reviewer", label: "🙋 Reviewer", sub: "Leave reviews" },
              { value: "business", label: "🏪 Business", sub: "Manage my listing" },
              { value: "influencer", label: "✦ Influencer", sub: "Connect with brands" },
            ].map(opt => (
              <div
                key={opt.value}
                onClick={() => setType(opt.value)}
                style={{ flex: 1, padding: "10px 8px", borderRadius: "12px", border: type === opt.value ? "2px solid #534AB7" : "1px solid #e5e5e5", background: type === opt.value ? "#EEEDFE" : "white", cursor: "pointer", textAlign: "center" }}
              >
                <div style={{ fontSize: "16px", marginBottom: "2px" }}>{opt.label}</div>
                <div style={{ fontSize: "10px", color: "#888" }}>{opt.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          onClick={handleSignup}
          style={{ background: loading ? "#9990D9" : "#534AB7", color: "white", padding: "16px", borderRadius: "14px", fontSize: "15px", fontWeight: "600", textAlign: "center", cursor: loading ? "not-allowed" : "pointer", marginBottom: "16px" }}
        >
          {loading ? "Creating account..." : "Create account"}
        </div>

        <div style={{ textAlign: "center", fontSize: "13px", color: "#888" }}>
          {"Already have an account? "}
          <Link href="/login" style={{ color: "#534AB7", fontWeight: "600", textDecoration: "none" }}>Sign in</Link>
        </div>

        <div style={{ fontSize: "11px", color: "#aaa", textAlign: "center", marginTop: "16px", lineHeight: "1.6" }}>
          By creating an account you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </main>
  )
}