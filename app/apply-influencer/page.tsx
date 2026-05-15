"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

const FOOD_NICHES = ["Food & Dining", "Lifestyle & Food", "Food & Travel", "Local Experiences", "Health & Wellness", "Fitness"]
const OTHER_NICHES = ["Real Estate", "Cars & Auto", "Fashion & Style", "Tech & Gadgets", "Finance", "Beauty & Skincare", "Gaming", "Sports", "Home & Decor", "Parenting", "Education"]

export default function ApplyInfluencer() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    niche: "",
    primary_platform: "",
    follower_count: "",
    instagram_handle: "",
    tiktok_handle: "",
    youtube_handle: "",
    location: "",
    engagement_rate: "",
  })
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return }
      setUser(data.user)
      setForm(prev => ({ ...prev, display_name: data.user.user_metadata?.full_name || "" }))
      setLoading(false)
    })
  }, [])

  const isEligibleNiche = FOOD_NICHES.includes(form.niche)
  const isOtherNiche = OTHER_NICHES.includes(form.niche)
  const meetsFollowerThreshold = parseInt(form.follower_count) >= 10000

  async function handleSubmit() {
    if (!form.display_name) { setError("Please enter your display name"); return }
    if (!form.niche) { setError("Please select your specialty"); return }
    if (!form.primary_platform) { setError("Please select your primary platform"); return }
    if (!form.follower_count || parseInt(form.follower_count) < 10000) { setError("You need at least 10,000 followers to apply"); return }
    if (!form.location) { setError("Please enter your location"); return }

    setSubmitting(true)
    setError("")

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const status = isEligibleNiche ? "pending" : "coming_soon"

    const { error } = await supabase.from("influencers").insert({
      user_id: user.id,
      display_name: form.display_name,
      bio: form.bio,
      niche: form.niche,
      specialty: form.niche,
      primary_platform: form.primary_platform,
      follower_count: parseInt(form.follower_count),
      instagram_handle: form.instagram_handle || null,
      tiktok_handle: form.tiktok_handle || null,
      youtube_handle: form.youtube_handle || null,
      location: form.location,
      engagement_rate: form.engagement_rate || null,
      status,
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      setSubmitted(true)
    }
  }

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#888" }}>Loading...</div>
    </div>
  )

  if (submitted) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>✦</div>
      <div style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>
        {isEligibleNiche ? "Welcome to Reviu!" : "You're in!"}
      </div>
      <div style={{ fontSize: "14px", color: "#888", marginBottom: "24px", lineHeight: "1.6" }}>
        {isEligibleNiche
          ? "We'll review your profile and get back to you soon. Welcome to the Reviu creator community!"
          : `Thanks for joining Reviu! Your specialty (${form.niche}) is coming soon to the platform. We'll notify you when it's live.`}
      </div>
      <Link href="/" style={{ display: "block", background: "#534AB7", color: "white", padding: "14px 32px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textDecoration: "none", width: "100%", textAlign: "center" }}>
        Back to home
      </Link>
    </div>
  )

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/influencers" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>Join as a Creator</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Connect with local businesses on Reviu</div>
        </div>
      </div>

      <div style={{ padding: "1rem" }}>
        <div style={{ background: "#EEEDFE", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#3C3489", lineHeight: "1.5" }}>
          ✦ Reviu verifies creators with 10,000+ followers. Connect with local businesses and build your legitimate reputation on the platform.
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Your info</div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Display name</label>
            <input value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} placeholder="How you appear on Reviu" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Location</label>
            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Cincinnati, OH" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "0" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell businesses what you're about..." style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", minHeight: "80px", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif", lineHeight: "1.5" }} />
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Your specialty</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
            {[...FOOD_NICHES, ...OTHER_NICHES].map(niche => (
              <div key={niche} onClick={() => setForm(p => ({ ...p, niche }))} style={{ padding: "10px 12px", borderRadius: "10px", border: form.niche === niche ? "2px solid #534AB7" : "1px solid #eee", background: form.niche === niche ? "#EEEDFE" : "#f7f7f5", cursor: "pointer", textAlign: "center", fontSize: "12px", fontWeight: "600", color: form.niche === niche ? "#534AB7" : "#555" }}>
                {niche}
              </div>
            ))}
          </div>
          {isOtherNiche && (
            <div style={{ background: "#FAEEDA", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", color: "#854F0B", lineHeight: "1.5" }}>
              ✦ {form.niche} is coming soon to Reviu! You can still join now and we'll notify you when your specialty goes live.
            </div>
          )}
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Your platform</div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {["Instagram", "TikTok", "YouTube"].map(platform => (
              <div key={platform} onClick={() => setForm(p => ({ ...p, primary_platform: platform }))} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: form.primary_platform === platform ? "2px solid #534AB7" : "1px solid #eee", background: form.primary_platform === platform ? "#EEEDFE" : "#f7f7f5", cursor: "pointer", textAlign: "center", fontSize: "12px", fontWeight: "600", color: form.primary_platform === platform ? "#534AB7" : "#555" }}>
                {platform}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Follower count on primary platform</label>
            <input type="number" value={form.follower_count} onChange={e => setForm(p => ({ ...p, follower_count: e.target.value }))} placeholder="e.g. 15000" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }} />
            {form.follower_count && !meetsFollowerThreshold && (
              <div style={{ fontSize: "11px", color: "#A32D2D", marginTop: "4px" }}>Minimum 10,000 followers required</div>
            )}
            {form.follower_count && meetsFollowerThreshold && (
              <div style={{ fontSize: "11px", color: "#3B6D11", marginTop: "4px" }}>✓ Meets the minimum requirement</div>
            )}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Engagement rate (optional)</label>
            <input value={form.engagement_rate} onChange={e => setForm(p => ({ ...p, engagement_rate: e.target.value }))} placeholder="e.g. 4.5%" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Instagram handle (optional)</label>
            <input value={form.instagram_handle} onChange={e => setForm(p => ({ ...p, instagram_handle: e.target.value }))} placeholder="@yourhandle" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>TikTok handle (optional)</label>
            <input value={form.tiktok_handle} onChange={e => setForm(p => ({ ...p, tiktok_handle: e.target.value }))} placeholder="@yourhandle" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>YouTube handle (optional)</label>
            <input value={form.youtube_handle} onChange={e => setForm(p => ({ ...p, youtube_handle: e.target.value }))} placeholder="@yourchannel" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }} />
          </div>
        </div>

        {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}

        <div onClick={handleSubmit} style={{ background: submitting ? "#9990D9" : "#534AB7", color: "white", padding: "16px", borderRadius: "14px", fontSize: "15px", fontWeight: "600", textAlign: "center", cursor: submitting ? "not-allowed" : "pointer" }}>
          {submitting ? "Submitting..." : "Submit"}
        </div>
      </div>
    </div>
  )
}