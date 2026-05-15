"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviuScore, setReviuScore] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const [pendingRes, reviewRes] = await Promise.all([
          supabase.from("reviews").select("id").eq("user_id", data.user.id).eq("status", "pending"),
          supabase.from("reviews").select("*, businesses(name)").eq("user_id", data.user.id).order("created_at", { ascending: false }),
        ])
        setPendingCount(pendingRes.data?.length || 0)
        const allReviews = reviewRes.data || []
        setReviews(allReviews)
        const scored = allReviews.filter(r => r.legitimacy_score)
        if (scored.length > 0) {
          const avg = Math.round(scored.reduce((sum: number, r: any) => sum + r.legitimacy_score, 0) / scored.length)
          setReviuScore(avg)
        }
      }
      setLoading(false)
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  function getScoreColor(score: number) {
    if (score >= 80) return { color: "#3B6D11", bg: "#EAF3DE" }
    if (score >= 60) return { color: "#534AB7", bg: "#EEEDFE" }
    return { color: "#854F0B", bg: "#FAEEDA" }
  }

  const accountType = user?.user_metadata?.account_type || "reviewer"
  const isBusinessOwner = accountType === "business"
  const isInfluencer = accountType === "influencer"
  const publishedReviews = reviews.filter(r => r.status === "published")

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#888", fontSize: "14px" }}>Loading...</div>
    </div>
  )

  if (!user) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem" }}>
        <span style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>My Profile</span>
      </div>
      <div style={{ padding: "3rem 1.25rem", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>👋</div>
        <div style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>Join Reviu</div>
        <div style={{ fontSize: "14px", color: "#888", marginBottom: "32px", lineHeight: "1.6" }}>
          Sign up to leave reviews, connect with businesses, and join the fairest review platform around.
        </div>
        <Link href="/signup" style={{ display: "block", background: "#534AB7", color: "white", padding: "16px", borderRadius: "14px", fontSize: "15px", fontWeight: "600", textAlign: "center", textDecoration: "none", marginBottom: "12px" }}>
          Create free account
        </Link>
        <Link href="/login" style={{ display: "block", background: "white", color: "#534AB7", padding: "16px", borderRadius: "14px", fontSize: "15px", fontWeight: "600", textAlign: "center", textDecoration: "none", border: "1px solid #534AB7" }}>
          Sign in
        </Link>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊞</span><span style={{ fontSize: "11px", color: "#888" }}>Home</span></Link>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊕</span><span style={{ fontSize: "11px", color: "#888" }}>Review</span></Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>✦</span><span style={{ fontSize: "11px", color: "#888" }}>Influencers</span></Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>◯</span><span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>Profile</span></Link>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>My Profile</span>
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", cursor: "pointer" }}>Settings</span>
      </div>

      <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "#534AB7", flexShrink: 0 }}>
            {user.email?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "700", marginBottom: "2px" }}>
              {user.user_metadata?.full_name || "Reviu Member"}
            </div>
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>{user.email}</div>
            <div style={{ display: "inline-block", background: "#EAF3DE", color: "#3B6D11", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" }}>
              {isBusinessOwner ? "Business Owner" : isInfluencer ? "Creator" : "Verified Reviewer"}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          <div style={{ background: "#f7f7f5", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Reviews</div>
            <div style={{ fontSize: "16px", fontWeight: "700" }}>{publishedReviews.length}</div>
          </div>
          <div style={{ background: reviuScore ? (getScoreColor(reviuScore).bg) : "#f7f7f5", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Reviu Score</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: reviuScore ? getScoreColor(reviuScore).color : "#888" }}>
              {reviuScore ? `✦ ${reviuScore}` : "—"}
            </div>
          </div>
          <div style={{ background: "#f7f7f5", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Helpful votes</div>
            <div style={{ fontSize: "16px", fontWeight: "700" }}>0</div>
          </div>
        </div>
      </div>

      {pendingCount > 0 && (
        <Link href="/resolution" style={{ textDecoration: "none", display: "block", margin: "0 0 8px 0" }}>
          <div style={{ background: "#FAEEDA", padding: "14px 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>⏱</span>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#854F0B" }}>
                  {pendingCount} review{pendingCount > 1 ? "s" : ""} in resolution
                </div>
                <div style={{ fontSize: "12px", color: "#854F0B" }}>A business has reached out — tap to respond</div>
              </div>
            </div>
            <span style={{ color: "#854F0B", fontSize: "18px" }}>›</span>
          </div>
        </Link>
      )}

      <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>My reviews</div>
        {publishedReviews.length === 0 ? (
          <>
            <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "1.5rem 0", background: "#f7f7f5", borderRadius: "12px" }}>
              No published reviews yet — go explore some businesses!
            </div>
            <Link href="/" style={{ display: "block", background: "#534AB7", color: "white", padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", textDecoration: "none", marginTop: "12px" }}>
              Browse businesses
            </Link>
          </>
        ) : (
          publishedReviews.map(review => (
            <div key={review.id} style={{ paddingBottom: "14px", marginBottom: "14px", borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>{review.businesses?.name}</div>
                <div style={{ display: "flex", gap: "1px" }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ fontSize: "12px", color: s <= review.stars ? "#534AB7" : "#ddd" }}>✦</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>
                {review.context_tag && `${review.context_tag} · `}
                {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {review.resolution_status === "resolved" && <span style={{ color: "#3B6D11", fontWeight: "600" }}> · ✓ Resolved</span>}
              </div>
              <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.5" }}>{review.text}</div>
              {review.legitimacy_score && (
                <div style={{ marginTop: "6px", fontSize: "11px", color: getScoreColor(review.legitimacy_score).color, fontWeight: "600" }}>
                  ✦ Reviu Score: {review.legitimacy_score}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isBusinessOwner && (
        <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Business owner tools</div>
          <Link href="/claim-business" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f5f5f5", textDecoration: "none" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#534AB7" }}>Claim your business</div>
              <div style={{ fontSize: "12px", color: "#888" }}>Verify and manage your listing</div>
            </div>
            <span style={{ color: "#ccc", fontSize: "16px" }}>›</span>
          </Link>
          <Link href="/business-dashboard" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", textDecoration: "none" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#534AB7" }}>Business dashboard</div>
              <div style={{ fontSize: "12px", color: "#888" }}>Manage reviews and reputation</div>
            </div>
            <span style={{ color: "#ccc", fontSize: "16px" }}>›</span>
          </Link>
        </div>
      )}

      {isInfluencer && (
        <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Creator tools</div>
          <Link href="/influencers" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", textDecoration: "none" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#534AB7" }}>My creator profile</div>
              <div style={{ fontSize: "12px", color: "#888" }}>Manage collaborations and rates</div>
            </div>
            <span style={{ color: "#ccc", fontSize: "16px" }}>›</span>
          </Link>
        </div>
      )}

      <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Account</div>
        {[
          { label: "Notification settings", sub: "Manage your alerts", href: "#" },
          { label: "Privacy settings", sub: "Control your data", href: "#" },
        ].map(item => (
          <Link key={item.label} href={item.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f5f5f5", textDecoration: "none" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#333" }}>{item.label}</div>
              <div style={{ fontSize: "12px", color: "#888" }}>{item.sub}</div>
            </div>
            <span style={{ color: "#ccc", fontSize: "16px" }}>›</span>
          </Link>
        ))}
        <div onClick={handleSignOut} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", cursor: "pointer" }}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#A32D2D" }}>Sign out</div>
          <span style={{ color: "#ccc", fontSize: "16px" }}>›</span>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊞</span><span style={{ fontSize: "11px", color: "#888" }}>Home</span></Link>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊕</span><span style={{ fontSize: "11px", color: "#888" }}>Review</span></Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>✦</span><span style={{ fontSize: "11px", color: "#888" }}>Influencers</span></Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>◯</span><span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>Profile</span></Link>
      </div>
    </div>
  )
}