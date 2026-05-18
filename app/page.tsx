"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import ReviButton from "./ReviButton"
import MediaViewer from "./MediaViewer"

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
  const [businesses, setBusinesses] = useState<any[]>([])
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [locationError, setLocationError] = useState(false)
  const [radius, setRadius] = useState(3)
  const [loading, setLoading] = useState(true)

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
      setBusinesses(bizRes.data || [])
      setRecentReviews(reviewRes.data || [])
      setLoading(false)
    })
  }, [location])

  const nearbyBusinesses = businesses.filter(b => {
    if (!b.latitude || !b.longitude) return true
    return getDistance(location?.lat || 39.1031, location?.lng || -84.5120, parseFloat(b.latitude), parseFloat(b.longitude)) <= radius
  })

  const nearbyReviews = recentReviews.filter(r => {
    const biz = r.businesses
    if (!biz?.latitude || !biz?.longitude) return true
    return getDistance(location?.lat || 39.1031, location?.lng || -84.5120, parseFloat(biz.latitude), parseFloat(biz.longitude)) <= radius
  })

  const specials = nearbyBusinesses.filter(b => b.special_today)
  const reviewsWithPhotos = nearbyReviews.filter(r => r.media_urls?.length > 0)

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

      {specials.length > 0 && (
        <div style={{ padding: "1.25rem 1.25rem 0" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>✦ Specials near you</div>
          {specials.map((biz: any) => (
            <Link key={biz.id} href={`/business/${biz.id}`} style={{ textDecoration: "none", display: "block", marginBottom: "10px" }}>
              <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid #eee", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
                  <img src={biz.cover_url || categoryPhotos[biz.category] || categoryPhotos.default} alt={biz.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: "#534AB7", background: "#EEEDFE", padding: "2px 8px", borderRadius: "10px" }}>SPECIAL</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#111" }}>{biz.name}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#555", lineHeight: "1.4" }}>{biz.special_today}</div>
                </div>
                <span style={{ color: "#ddd", fontSize: "18px" }}>›</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {reviewsWithPhotos.length > 0 && (
        <div style={{ padding: "1.25rem 1.25rem 0" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>📸 Just posted near you</div>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" } as any}>
            {reviewsWithPhotos.slice(0, 10).map((review: any) => (
              <Link key={review.id} href={`/business/${review.business_id}`} style={{ textDecoration: "none", flexShrink: 0, width: "130px" }}>
                <div style={{ borderRadius: "14px", overflow: "hidden", height: "130px", background: "#ddd", marginBottom: "6px", position: "relative" }}>
                  <img src={review.media_urls[0]} alt="Review photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)" }} />
                  <div style={{ position: "absolute", bottom: "6px", left: "6px", right: "6px" }}>
                    <div style={{ fontSize: "10px", fontWeight: "600", color: "white", lineHeight: "1.3" }}>{review.businesses?.name}</div>
                  </div>
                </div>
                <div style={{ fontSize: "11px", color: "#888" }}>{review.reviewer_name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {nearbyReviews.length > 0 && (
        <div style={{ padding: "1.25rem 1.25rem 0" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>💬 Recent reviews near you</div>
          {nearbyReviews.slice(0, 5).map((review: any) => (
            <Link key={review.id} href={`/business/${review.business_id}`} style={{ textDecoration: "none", display: "block", marginBottom: "10px" }}>
              <div style={{ background: "white", borderRadius: "16px", padding: "14px 16px", border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#111", marginBottom: "2px" }}>{review.businesses?.name}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>{review.reviewer_name} · {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                  </div>
                  <div style={{ display: "flex", gap: "1px" }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ fontSize: "11px", color: s <= review.stars ? "#534AB7" : "#ddd" }}>✦</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.5", marginBottom: review.media_urls?.length > 0 ? "10px" : "0" }}>
                  {review.text?.slice(0, 120)}{review.text?.length > 120 ? "..." : ""}
                </div>
                {review.media_urls?.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
                    {review.media_urls.slice(0, 3).map((url: string, i: number) => (
                      <img key={i} src={url} alt="Review photo" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ padding: "1.25rem 1.25rem 0" }}>
        <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
          📍 Near you — {nearbyBusinesses.length} spot{nearbyBusinesses.length !== 1 ? "s" : ""} within {radius} miles
        </div>

        {nearbyBusinesses.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", background: "white", borderRadius: "16px", marginBottom: "12px" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📍</div>
            <div style={{ fontSize: "14px", color: "#888", marginBottom: "12px" }}>No businesses within {radius} miles yet</div>
            <div onClick={() => setRadius(r => r === 3 ? 5 : r === 5 ? 10 : 10)} style={{ fontSize: "13px", color: "#534AB7", fontWeight: "600", cursor: "pointer" }}>
              {radius < 10 ? `Expand to ${radius === 3 ? 5 : 10} miles →` : "More businesses coming soon"}
            </div>
          </div>
        )}

        {nearbyBusinesses.map((biz: any) => (
          <Link key={biz.id} href={`/business/${biz.id}`} style={{ textDecoration: "none", display: "block", marginBottom: "10px" }}>
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid #eee", display: "flex", height: "88px" }}>
              <div style={{ width: "88px", flexShrink: 0, background: "#ddd" }}>
                <img src={biz.cover_url || categoryPhotos[biz.category] || categoryPhotos.default} alt={biz.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginBottom: "3px" }}>{biz.name}</div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>{biz.category} · {biz.city}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#534AB7" }}>{"✦".repeat(Math.round(biz.google_rating || 0))}</span>
                  <span style={{ fontSize: "11px", color: "#888" }}>{biz.google_rating}</span>
                  {biz.special_today && <span style={{ fontSize: "10px", color: "#534AB7", background: "#EEEDFE", padding: "1px 6px", borderRadius: "6px", fontWeight: "600" }}>Special today</span>}
                  {!biz.claimed && !biz.special_today && <span style={{ fontSize: "10px", color: "#854F0B", background: "#FAEEDA", padding: "1px 6px", borderRadius: "6px", fontWeight: "600" }}>Unclaimed</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", padding: "0 12px" }}>
                <span style={{ color: "#ddd", fontSize: "18px" }}>›</span>
              </div>
            </div>
          </Link>
        ))}

        {nearbyBusinesses.length > 0 && radius < 10 && (
          <div onClick={() => setRadius(r => r === 3 ? 5 : 10)} style={{ textAlign: "center", padding: "14px", background: "white", borderRadius: "16px", border: "1px solid #eee", fontSize: "13px", color: "#534AB7", fontWeight: "600", cursor: "pointer", marginTop: "4px" }}>
            Show more within {radius === 3 ? 5 : 10} miles →
          </div>
        )}
      </div>

      <ReviButton />

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <div onClick={() => window.scrollTo(0, 0)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer" }}>
          <span style={{ fontSize: "20px" }}>⊞</span>
          <span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>Feed</span>
        </div>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
          <span style={{ fontSize: "20px" }}>⊕</span>
          <span style={{ fontSize: "11px", color: "#888" }}>Review</span>
        </Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
          <span style={{ fontSize: "20px" }}>✦</span>
          <span style={{ fontSize: "11px", color: "#888" }}>Influencers</span>
        </Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
          <span style={{ fontSize: "20px" }}>◯</span>
          <span style={{ fontSize: "11px", color: "#888" }}>Profile</span>
        </Link>
      </div>
    </div>
  )
}