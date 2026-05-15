"use client"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { useSearchParams } from "next/navigation"

function ReviewerProfileContent() {
  const [reviewer, setReviewer] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviuScore, setReviuScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const userId = searchParams.get("id")

  useEffect(() => {
    if (!userId) return
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase
      .from("reviews")
      .select("*, businesses(name, brand_color)")
      .eq("user_id", userId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const allReviews = data || []
        setReviews(allReviews)
        if (allReviews.length > 0) {
          setReviewer({
            name: allReviews[0].reviewer_name,
            initials: allReviews[0].reviewer_initials,
          })
          const scored = allReviews.filter(r => r.legitimacy_score)
          if (scored.length > 0) {
            const avg = Math.round(scored.reduce((sum: number, r: any) => sum + r.legitimacy_score, 0) / scored.length)
            setReviuScore(avg)
          }
        }
        setLoading(false)
      })
  }, [userId])

  function getScoreColor(score: number) {
    if (score >= 80) return { color: "#3B6D11", bg: "#EAF3DE" }
    if (score >= 60) return { color: "#534AB7", bg: "#EEEDFE" }
    return { color: "#854F0B", bg: "#FAEEDA" }
  }

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#888" }}>Loading...</div>
    </div>
  )

  if (!reviewer) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#888" }}>Reviewer not found</div>
    </div>
  )

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <span style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>Reviewer Profile</span>
      </div>

      <div style={{ background: "white", padding: "1.5rem 1.25rem", marginBottom: "8px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "#534AB7", flexShrink: 0 }}>
            {reviewer.initials}
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>{reviewer.name}</div>
            <div style={{ display: "inline-block", background: "#EAF3DE", color: "#3B6D11", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" }}>
              Verified Reviewer
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div style={{ background: "#f7f7f5", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Reviews</div>
            <div style={{ fontSize: "20px", fontWeight: "700" }}>{reviews.length}</div>
          </div>
          <div style={{ background: reviuScore ? getScoreColor(reviuScore).bg : "#f7f7f5", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Reviu Score</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: reviuScore ? getScoreColor(reviuScore).color : "#888" }}>
              {reviuScore ? `✦ ${reviuScore}` : "—"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Reviews</div>
        {reviews.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "2rem 0" }}>No published reviews yet</div>
        ) : (
          reviews.map(review => (
            <div key={review.id} style={{ paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <Link href={`/business/${review.business_id}`} style={{ fontSize: "14px", fontWeight: "600", color: "#534AB7", textDecoration: "none" }}>
                    {review.businesses?.name}
                  </Link>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                    {review.context_tag && `${review.context_tag} · `}
                    {review.is_first_visit && "First visit · "}
                    {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <div style={{ display: "flex", gap: "1px" }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ fontSize: "12px", color: s <= review.stars ? "#534AB7" : "#ddd" }}>✦</span>
                    ))}
                  </div>
                  {review.legitimacy_score && (
                    <div style={{ fontSize: "10px", fontWeight: "700", color: getScoreColor(review.legitimacy_score).color, background: getScoreColor(review.legitimacy_score).bg, padding: "2px 6px", borderRadius: "8px" }}>
                      ✦ {review.legitimacy_score}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.6", marginBottom: review.media_urls?.length > 0 ? "10px" : "0" }}>{review.text}</div>
              {review.media_urls?.length > 0 && (
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
                  {review.media_urls.map((url: string, i: number) => (
                    <img key={i} src={url} alt={`Review photo ${i+1}`} style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                  ))}
                </div>
              )}
              {review.resolution_status === "resolved" && (
                <div style={{ marginTop: "8px", fontSize: "11px", color: "#3B6D11", fontWeight: "600" }}>✓ Resolved</div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊞</span><span style={{ fontSize: "11px", color: "#888" }}>Home</span></Link>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊕</span><span style={{ fontSize: "11px", color: "#888" }}>Review</span></Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>✦</span><span style={{ fontSize: "11px", color: "#888" }}>Influencers</span></Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>◯</span><span style={{ fontSize: "11px", color: "#888" }}>Profile</span></Link>
      </div>
    </div>
  )
}

export default function ReviewerProfile() {
  return (
    <Suspense fallback={<div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#888" }}>Loading...</div></div>}>
      <ReviewerProfileContent />
    </Suspense>
  )
}