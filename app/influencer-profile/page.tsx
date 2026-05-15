"use client"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { useSearchParams } from "next/navigation"

function InfluencerProfileContent() {
  const [influencer, setInfluencer] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  useEffect(() => {
    if (!id) return
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    Promise.all([
      supabase.from("influencers").select("*").eq("id", id).single(),
      supabase.from("reviews").select("*, businesses(name)").eq("user_id", id).eq("status", "published").order("created_at", { ascending: false }).limit(10),
    ]).then(([infRes, reviewRes]) => {
      setInfluencer(infRes.data)
      setReviews(reviewRes.data || [])
      setLoading(false)
    })
  }, [id])

  function getTierLabel(score: number, followers: number) {
    if (followers >= 100000) return { label: "Top Creator", color: "#185FA5", bg: "#E6F1FB" }
    if (score >= 90) return { label: "Verified Influencer", color: "#3C3489", bg: "#EEEDFE" }
    if (followers >= 10000) return { label: "Rising Creator", color: "#854F0B", bg: "#FAEEDA" }
    return { label: "Local Voice", color: "#3B6D11", bg: "#EAF3DE" }
  }

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#888" }}>Loading...</div>
    </div>
  )

  if (!influencer) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#888" }}>Creator not found</div>
    </div>
  )

  const tier = getTierLabel(influencer.reviu_score || 0, influencer.follower_count || 0)
  const followers = influencer.follower_count >= 1000000
    ? `${(influencer.follower_count / 1000000).toFixed(1)}M`
    : influencer.follower_count >= 1000
    ? `${(influencer.follower_count / 1000).toFixed(1)}K`
    : influencer.follower_count?.toString()

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/influencers" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <span style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>Creator Profile</span>
      </div>

      <div style={{ background: "white", padding: "1.5rem 1.25rem", marginBottom: "8px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "#534AB7", flexShrink: 0, overflow: "hidden" }}>
            {influencer.profile_photo_url
              ? <img src={influencer.profile_photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : influencer.display_name?.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>{influencer.display_name}</div>
            <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>{influencer.niche} · {influencer.location}</div>
            <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", background: tier.bg, color: tier.color }}>{tier.label}</span>
          </div>
        </div>

        {influencer.bio && (
          <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.6", marginBottom: "16px" }}>{influencer.bio}</div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          <div style={{ background: "#f7f7f5", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Followers</div>
            <div style={{ fontSize: "16px", fontWeight: "700" }}>{followers}</div>
          </div>
          {influencer.engagement_rate && (
            <div style={{ background: "#f7f7f5", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Engagement</div>
              <div style={{ fontSize: "16px", fontWeight: "700" }}>{influencer.engagement_rate}</div>
            </div>
          )}
          <div style={{ background: "#EEEDFE", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Reviu Score</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#534AB7" }}>
              {influencer.reviu_score ? `✦ ${influencer.reviu_score}` : "—"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Platform</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {influencer.primary_platform && (
            <div style={{ background: "#EEEDFE", color: "#534AB7", fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "20px" }}>
              ✦ {influencer.primary_platform}
            </div>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Reviews on Reviu</div>
          {reviews.map(review => (
            <div key={review.id} style={{ paddingBottom: "14px", marginBottom: "14px", borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <Link href={`/business/${review.business_id}`} style={{ fontSize: "14px", fontWeight: "600", color: "#534AB7", textDecoration: "none" }}>
                  {review.businesses?.name}
                </Link>
                <div style={{ display: "flex", gap: "1px" }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ fontSize: "12px", color: s <= review.stars ? "#534AB7" : "#ddd" }}>✦</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.5" }}>{review.text}</div>
              {review.media_urls?.length > 0 && (
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginTop: "8px", paddingBottom: "4px" }}>
                  {review.media_urls.map((url: string, i: number) => (
                    <img key={i} src={url} alt={`Review photo ${i+1}`} style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: "0 1rem" }}>
        <div style={{ background: "#534AB7", color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>
          Connect with {influencer.display_name}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊞</span><span style={{ fontSize: "11px", color: "#888" }}>Home</span></Link>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊕</span><span style={{ fontSize: "11px", color: "#888" }}>Review</span></Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>✦</span><span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>Influencers</span></Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>◯</span><span style={{ fontSize: "11px", color: "#888" }}>Profile</span></Link>
      </div>
    </div>
  )
}

export default function InfluencerProfile() {
  return (
    <Suspense fallback={<div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#888" }}>Loading...</div></div>}>
      <InfluencerProfileContent />
    </Suspense>
  )
}