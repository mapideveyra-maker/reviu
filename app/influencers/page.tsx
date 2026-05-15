"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const CATEGORIES = ["All", "Food & Dining", "Lifestyle & Food", "Food & Travel", "Health & Wellness", "Fitness"]

export default function Influencers() {
  const [influencers, setInfluencers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase
      .from("influencers")
      .select("*")
      .eq("status", "approved")
      .order("reviu_score", { ascending: false })
      .then(({ data }) => {
        setInfluencers(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = influencers.filter(inf => {
    const matchesCategory = activeCategory === "All" || inf.niche === activeCategory
    const matchesSearch = inf.display_name?.toLowerCase().includes(search.toLowerCase()) || inf.niche?.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  function getTierLabel(score: number, followers: number) {
    if (followers >= 100000) return { label: "Top Creator", color: "#185FA5", bg: "#E6F1FB" }
    if (score >= 90) return { label: "Verified Influencer", color: "#3C3489", bg: "#EEEDFE" }
    if (followers >= 10000) return { label: "Rising Creator", color: "#854F0B", bg: "#FAEEDA" }
    return { label: "Local Voice", color: "#3B6D11", bg: "#EAF3DE" }
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>Creators</span>
        <Link href="/apply-influencer" style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "20px", textDecoration: "none" }}>
          Join as creator
        </Link>
      </div>

      <div style={{ padding: "1rem" }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search creators by name or niche..."
          style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "white", marginBottom: "1rem", boxSizing: "border-box" }}
        />

        <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "1.25rem", paddingBottom: "4px", scrollbarWidth: "none" } as any}>
          {CATEGORIES.map(cat => (
            <div key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "6px 14px", borderRadius: "20px", background: activeCategory === cat ? "#534AB7" : "white", color: activeCategory === cat ? "white" : "#666", fontSize: "13px", whiteSpace: "nowrap", border: "1px solid #e5e5e5", cursor: "pointer", flexShrink: 0 }}>{cat}</div>
          ))}
        </div>

        <div style={{ background: "#EEEDFE", borderRadius: "12px", padding: "12px 16px", marginBottom: "1.25rem", fontSize: "13px", color: "#3C3489", lineHeight: "1.5" }}>
          ✦ Are you a creator? <Link href="/apply-influencer" style={{ color: "#534AB7", fontWeight: "700", textDecoration: "none" }}>Join Reviu</Link> and connect directly with local businesses.
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>Loading creators...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", background: "white", borderRadius: "16px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✦</div>
            <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>No creators yet</div>
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "20px", lineHeight: "1.6" }}>
              Reviu is launching soon in Cincinnati. Be among the first creators on the platform.
            </div>
            <Link href="/apply-influencer" style={{ display: "block", background: "#534AB7", color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textDecoration: "none", textAlign: "center" }}>
              Join now
            </Link>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Featured creators</div>
            {filtered.map(inf => {
              const tier = getTierLabel(inf.reviu_score, inf.follower_count)
              const followers = inf.follower_count >= 1000000
                ? `${(inf.follower_count / 1000000).toFixed(1)}M`
                : inf.follower_count >= 1000
                ? `${(inf.follower_count / 1000).toFixed(1)}K`
                : inf.follower_count?.toString()

              return (
                <div key={inf.id} style={{ background: "white", borderRadius: "16px", padding: "1rem 1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700", color: "#534AB7", flexShrink: 0, overflow: "hidden" }}>
                      {inf.profile_photo_url ? <img src={inf.profile_photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : inf.display_name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "15px", fontWeight: "600" }}>{inf.display_name}</span>
                        <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", background: tier.bg, color: tier.color }}>{tier.label}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#888" }}>{inf.niche} · {inf.location}</div>
                    </div>
                    {inf.reviu_score > 0 && (
                      <div style={{ background: "#EAF3DE", color: "#3B6D11", fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "8px", textAlign: "center" }}>✦ {inf.reviu_score}</div>
                    )}
                  </div>

                  {inf.bio && (
                    <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.5", marginBottom: "12px" }}>{inf.bio}</div>
                  )}

                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ flex: 1, background: "#f7f7f5", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>Followers</div>
                      <div style={{ fontSize: "14px", fontWeight: "700" }}>{followers}</div>
                    </div>
                    {inf.engagement_rate && (
                      <div style={{ flex: 1, background: "#f7f7f5", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>Engagement</div>
                        <div style={{ fontSize: "14px", fontWeight: "700" }}>{inf.engagement_rate}</div>
                      </div>
                    )}
                    <div style={{ flex: 1, background: "#f7f7f5", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>Platform</div>
                      <div style={{ fontSize: "14px", fontWeight: "700" }}>{inf.primary_platform}</div>
                    </div>
                  </div>

                  <Link href={`/influencer-profile?id=${inf.id}`} style={{ display: "block", background: "#534AB7", color: "white", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", textDecoration: "none" }}>
                    View Profile
                  </Link>
                </div>
              )
            })}
          </>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊞</span><span style={{ fontSize: "11px", color: "#888" }}>Home</span></Link>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊕</span><span style={{ fontSize: "11px", color: "#888" }}>Review</span></Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>✦</span><span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>Influencers</span></Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>◯</span><span style={{ fontSize: "11px", color: "#888" }}>Profile</span></Link>
      </div>
    </main>
  )
}