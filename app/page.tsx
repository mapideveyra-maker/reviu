"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const categoryPhotos: Record<string, string> = {
  "Fine Dining": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "Italian Restaurant": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
  "Mexican Restaurant": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
  "Asian Restaurant": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80",
  "Experience": "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800&q=80",
  "Fitness": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  "Retail": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  "Grocery": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
  "Services": "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80",
  "Health": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
  "default": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function Home() {
  const [feedItems, setFeedItems] = useState<any[]>([])
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [locationError, setLocationError] = useState(false)
  const [radius, setRadius] = useState(3)
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setLocationError(true)
        setLocation({ lat: 39.1031, lng: -84.5120 })
      }
    )
  }, [])

  useEffect(() => {
    if (!location) return
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    Promise.all([
      supabase.from("businesses").select("*"),
      supabase.from("reviews").select("*, businesses(name, latitude, longitude, category, cover_url)").eq("status", "published").order("created_at", { ascending: false }).limit(50),
    ]).then(([bizRes, reviewRes]) => {
      const allBiz = bizRes.data || []
      const allReviews = reviewRes.data || []

      const nearbyBiz = allBiz.filter(b => {
        if (!b.latitude || !b.longitude) return true
        return getDistance(location.lat, location.lng, parseFloat(b.latitude), parseFloat(b.longitude)) <= radius
      })

      const nearbyReviews = allReviews.filter(r => {
        const biz = r.businesses
        if (!biz?.latitude || !biz?.longitude) return true
        return getDistance(location.lat, location.lng, parseFloat(biz.latitude), parseFloat(biz.longitude)) <= radius
      })

      const items: any[] = []

      nearbyBiz.filter(b => b.special_today).forEach(biz => {
        items.push({ type: "special", biz, createdAt: biz.updated_at || biz.created_at })
      })

      nearbyReviews.forEach(review => {
        items.push({ type: "review", review, createdAt: review.created_at })
      })

      nearbyBiz.forEach(biz => {
        items.push({ type: "business", biz, createdAt: biz.created_at })
      })

      items.sort((a, b) => {
        const typeOrder: Record<string, number> = { special: 0, review: 1, business: 2 }
        if (typeOrder[a.type] !== typeOrder[b.type]) return typeOrder[a.type] - typeOrder[b.type]
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      setFeedItems(items)
      setLoading(false)
    })
  }, [location, radius])

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>✦</div>
        <div style={{ color: "#888", fontSize: "14px" }}>Finding what's near you...</div>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>

      {selectedPhoto && (
        <div onClick={() => setSelectedPhoto(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ position: "absolute", top: "16px", right: "16px", color: "white", fontSize: "28px", cursor: "pointer" }}>✕</div>
          <img src={selectedPhoto} alt="Full size" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "12px", objectFit: "contain" }} onClick={e => e.stopPropagation()} />
        </div>
      )}

      <div style={{ background: "#534AB7", padding: "1rem 1.25rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "white", letterSpacing: "-0.5px" }}>Reviu</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginTop: "1px" }}>
            {locationError ? "Cincinnati, OH" : `Within ${radius} miles of you`}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/post-review" style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "20px", textDecoration: "none" }}>
            + Review
          </Link>
          <Link href="/profile" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            <span style={{ fontSize: "16px", color: "white" }}>◯</span>
          </Link>
        </div>
      </div>

      <div>
        {feedItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 1.25rem" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📍</div>
            <div style={{ fontSize: "14px", color: "#888", marginBottom: "12px" }}>Nothing within {radius} miles yet</div>
            <div onClick={() => setRadius(r => r === 3 ? 5 : 10)} style={{ fontSize: "13px", color: "#534AB7", fontWeight: "600", cursor: "pointer" }}>
              {radius < 10 ? `Expand to ${radius === 3 ? 5 : 10} miles →` : "More coming soon"}
            </div>
          </div>
        )}

        {feedItems.map((item) => {
          if (item.type === "special") {
            const biz = item.biz
            return (
              <Link key={`special-${biz.id}`} href={`/business/${biz.id}`} style={{ textDecoration: "none", display: "block" }}>
                <div style={{ position: "relative", height: "280px" }}>
                  <img src={biz.special_media_url || biz.cover_url || categoryPhotos[biz.category] || categoryPhotos.default} alt={biz.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)" }} />
                  <div style={{ position: "absolute", top: "14px", left: "14px", background: "#534AB7", color: "white", fontSize: "10px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px" }}>✦ SPECIAL TODAY</div>
                  <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "white", marginBottom: "4px" }}>{biz.name}</div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)" }}>{biz.special_today}</div>
                  </div>
                </div>
                <div style={{ height: "1px", background: "#eee" }} />
              </Link>
            )
          }

          if (item.type === "review") {
            const review = item.review
            return (
              <div key={`review-${review.id}`} style={{ padding: "16px 1.25rem", borderBottom: "1px solid #eee" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#534AB7", flexShrink: 0 }}>
                    {review.reviewer_initials || "R"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{review.reviewer_name}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>
                      reviewed <Link href={`/business/${review.business_id}`} style={{ color: "#534AB7", textDecoration: "none", fontWeight: "600" }}>{review.businesses?.name}</Link> · {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1px" }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ fontSize: "11px", color: s <= review.stars ? "#534AB7" : "#ddd" }}>✦</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: "14px", color: "#333", lineHeight: "1.6", marginBottom: review.media_urls?.length > 0 ? "12px" : "0" }}>
                  {review.text?.slice(0, 200)}{review.text?.length > 200 ? "..." : ""}
                </div>
                {review.media_urls?.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginLeft: "-1.25rem", paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "4px" }}>
                    {review.media_urls.map((url: string, i: number) => (
                      <img key={i} src={url} alt="Review photo" onClick={() => setSelectedPhoto(url)} style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "12px", flexShrink: 0, cursor: "pointer" }} />
                    ))}
                  </div>
                )}
              </div>
            )
          }

          if (item.type === "business") {
            const biz = item.biz
            return (
              <Link key={`biz-${biz.id}`} href={`/business/${biz.id}`} style={{ textDecoration: "none", display: "flex", gap: "14px", alignItems: "center", padding: "14px 1.25rem", borderBottom: "1px solid #eee" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "14px", overflow: "hidden", flexShrink: 0 }}>
                  <img src={biz.cover_url || categoryPhotos[biz.category] || categoryPhotos.default} alt={biz.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginBottom: "3px" }}>{biz.name}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>{biz.category} · {biz.city}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#534AB7" }}>{"✦".repeat(Math.round(biz.google_rating || 0))}</span>
                    <span style={{ fontSize: "11px", color: "#888" }}>{biz.google_rating}</span>
                    {biz.special_today && <span style={{ fontSize: "10px", color: "#534AB7", background: "#EEEDFE", padding: "1px 6px", borderRadius: "6px", fontWeight: "600" }}>Special today</span>}
                    {!biz.claimed && !biz.special_today && <span style={{ fontSize: "10px", color: "#854F0B", background: "#FAEEDA", padding: "1px 6px", borderRadius: "6px", fontWeight: "600" }}>Unclaimed</span>}
                  </div>
                </div>
                <span style={{ color: "#ddd", fontSize: "18px" }}>›</span>
              </Link>
            )
          }

          return null
        })}

        {feedItems.length > 0 && radius < 10 && (
          <div onClick={() => setRadius(r => r === 3 ? 5 : 10)} style={{ textAlign: "center", padding: "20px", fontSize: "13px", color: "#534AB7", fontWeight: "600", cursor: "pointer" }}>
            Show more within {radius === 3 ? 5 : 10} miles →
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <div onClick={() => window.scrollTo(0, 0)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer" }}>
          <span style={{ fontSize: "20px" }}>⊞</span>
          <span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>Feed</span>
        </div>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
          <span style={{ fontSize: "20px" }}>⊕</span>
          <span style={{ fontSize: "11px", color: "#888" }}>Review</span>
        </Link>
        <Link href="/revi" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
          <span style={{ fontSize: "20px" }}>✦</span>
          <span style={{ fontSize: "11px", color: "#888" }}>Revi</span>
        </Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
          <span style={{ fontSize: "20px" }}>⊕</span>
          <span style={{ fontSize: "11px", color: "#888" }}>Creators</span>
        </Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
          <span style={{ fontSize: "20px" }}>◯</span>
          <span style={{ fontSize: "11px", color: "#888" }}>Profile</span>
        </Link>
      </div>
    </div>
  )
}