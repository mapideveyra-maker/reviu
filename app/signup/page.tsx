"use client"
import { useState, useRef } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [type, setType] = useState("reviewer")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSignup() {
    if (!name) { setError("Please enter your full name"); return }
    if (!email) { setError("Please enter your email"); return }
    if (!password) { setError("Please enter a password"); return }
    if (!photoFile) { setError("Please add a profile photo"); return }

    setLoading(true)
    setError("")

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, account_type: type } }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user && photoFile) {
      const ext = photoFile.name.split(".").pop()
      const fileName = `profiles/${authData.user.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("reviu-media")
        .upload(fileName, photoFile, { upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("reviu-media")
          .getPublicUrl(fileName)

        await supabase.auth.updateUser({
          data: { profile_photo_url: urlData.publicUrl, full_name: name, account_type: type }
        })
      }
    }

    setLoading(false)
    router.push("/")
    router.refresh()
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#534AB7", padding: "1.5rem 1.25rem" }}>
        <div style={{ fontSize: "22px", fontWeight: "700", color: "white", marginBottom: "4px" }}>Reviu</div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Create your account</div>
      </div>

      <div style={{ padding: "2rem 1.25rem", flex: 1 }}>

        {error && (
          <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <div onClick={() => fileInputRef.current?.click()} style={{ width: "100px", height: "100px", borderRadius: "50%", background: photoPreview ? "transparent" : "#EEEDFE", border: photoPreview ? "3px solid #534AB7" : "3px dashed #534AB7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", cursor: "pointer", overflow: "hidden" }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "28px", marginBottom: "2px" }}>📸</div>
                  <div style={{ fontSize: "10px", color: "#534AB7", fontWeight: "600" }}>Add photo</div>
                </div>
              )}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#111", marginBottom: "2px" }}>Profile photo required</div>
            <div style={{ fontSize: "11px", color: "#888" }}>A clear photo of your face. This builds trust with businesses and other reviewers.</div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handlePhotoSelect} style={{ display: "none" }} />
          {photoPreview && (
            <div onClick={() => fileInputRef.current?.click()} style={{ textAlign: "center", fontSize: "12px", color: "#534AB7", fontWeight: "600", cursor: "pointer", marginTop: "6px" }}>
              Change photo
            </div>
          )}
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: "#555", display: "block", marginBottom: "6px" }}>Full name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your real name"
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

        <div style={{ marginBottom: "20px" }}>
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
              { value: "business", label: "🪪 Business", sub: "Manage my listing" },
              { value: "influencer", label: "✦ Creator", sub: "Connect with brands" },
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
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#534AB7", fontWeight: "600", textDecoration: "none" }}>Sign in</Link>
        </div>

        <div style={{ fontSize: "11px", color: "#aaa", textAlign: "center", marginTop: "16px", lineHeight: "1.6" }}>
          By creating an account you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </main>
  )
}