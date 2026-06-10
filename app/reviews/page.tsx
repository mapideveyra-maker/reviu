"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function avatarColor(name: string) {
  const palette = ["#534AB7", "#E53E6B", "#2E7D32", "#B45309", "#0F766E", "#6D28D9", "#C2410C", "#1D4ED8"]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palette.length
  return palette[Math.abs(h)]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const PLACES_PER_PAGE = 20

export default function ReviewsPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationReady, setLocationReady] = useState(false)
  const [places, setPlaces] = useState<any[]>([])   // grouped: { key, name, href, score, dist, reviews[] }
  const [shownCount, setShownCount] = useState(PLACES_PER_PAGE)
  const [loading, setLoading] = useState(true)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<{ lat: number; lng: number } | null>(null)
  useEffect(() => { locationRef.current = location }, [location])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationReady(true) },
      () => { setLocation(null); setLocationReady(true) }
    )
  }, [])

  useEffect(() => {
    if (locationReady) load()
  }, [locationReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // auto-load more when the bottom comes into view
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) setShownCount(prev => prev + PLACES_PER_PAGE) },
      { rootMargin: "300px", threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loading])

  async function load() {
    setLoading(true)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from("reviews")
      .select("*, businesses(name, latitude, longitude)")
      .eq("status", "published")
      .order("created_at", { ascending: false })

    const all = data || []
    const loc = locationRef.current

    // group reviews by place
    const groups: Record<string, any> = {}
    for (const r of all) {
      const key = r.business_id || r.google_place_id || "unknown"
      if (!groups[key]) {
        const biz = r.businesses
        let dist: number | null = null
        if (biz?.latitude && biz?.longitude && loc) {
          dist = getDistance(loc.lat, loc.lng, parseFloat(biz.latitude), parseFloat(biz.longitude))
        }
        groups[key] = {
          key,
          name: biz?.name || "Place",
          href: r.business_id ? `/business/${r.business_id}` : r.google_place_id ? `/search/${r.google_place_id}` : null,
          dist,
          reviews: [],
        }
      }
      groups[key].reviews.push(r)
    }

    // per place: average stars + keep the 3 newest reviews (already newest-first from DB)
    const list = Object.values(groups).map((g: any) => {
      const avg = g.reviews.reduce((s: number, r: any) => s + (r.stars || 0), 0) / g.reviews.length
      return { ...g, score: avg, total: g.reviews.length, reviews: g.reviews.slice(0, 3) }
    })

    // closest first; places with no coords go last
    list.sort((a: any, b: any) => {
      if (a.dist === null && b.dist === null) return 0
      if (a.dist === null) return 1
      if (b.dist === null) return -1
      return a.dist - b.dist
    })

    setPlaces(list)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>✦</div>
        <div style={{ color: "#888", fontSize: "14px" }}>Loading reviews…</div>
      </div>
    </div>
  )

  const visible = places.slice(0, shownCount)

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>

      <div style={{ background: "#534AB7", padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: "22px", fontWeight: "700", color: "white", letterSpacing: "-0.5px" }}>Reviews</div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginTop: "2px" }}>Real experiences from Reviu members</div>
      </div>

      <div>
        {places.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 1.25rem" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>◈</div>
            <div style={{ fontSize: "14px", color: "#888", marginBottom: "16px" }}>No reviews yet — be the first!</div>
            <Link href="/post-review" style={{ display: "inline-block", background: "#534AB7", color: "white", padding: "12px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
              Write a review
            </Link>
          </div>
        )}

        {visible.map(place => (
          <Link key={place.key} href={place.href || "#"} style={{ textDecoration: "none", display: "block" }}>
            <div style={{ background: "white", padding: "16px 1.25rem", borderBottom: "1px solid #eee" }}>

              {/* place header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{place.name}</div>
                  <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                    {place.dist !== null && (place.dist < 0.1 ? "Here" : `${place.dist.toFixed(1)} mi away`)}
                    {place.total > 3 && <span> · {place.total} reviews</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#EEEDFE", padding: "5px 12px", borderRadius: "20px", flexShrink: 0 }}>
                  <span style={{ color: "#534AB7", fontSize: "13px" }}>✦</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#534AB7" }}>{place.score.toFixed(1)}</span>
                </div>
              </div>

              {/* 2-3 newest reviews */}
              {place.reviews.map((review: any) => (
                <div key={review.id} style={{ paddingTop: "10px", marginTop: "10px", borderTop: "1px solid #f3f3f3" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: avatarColor(review.reviewer_name || "?"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "white", flexShrink: 0 }}>
                      {review.reviewer_initials || "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{review.reviewer_name || "Anonymous"}</div>
                      <div style={{ fontSize: "11px", color: "#aaa" }}>{formatDate(review.created_at)}</div>
                    </div>
                    <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} style={{ fontSize: "11px", color: s <= review.stars ? "#534AB7" : "#e0e0e0" }}>✦</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.6", marginBottom: review.media_urls?.length > 0 ? "10px" : "0" }}>
                    {review.text?.slice(0, 200)}{review.text?.length > 200 ? "…" : ""}
                  </div>
                  {review.media_urls?.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
                      {review.media_urls.slice(0, 5).map((url: string, i: number) => (
                        <img key={i} src={url} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {place.total > 3 && (
                <div style={{ marginTop: "12px", fontSize: "12px", fontWeight: "600", color: "#534AB7" }}>
                  See all {place.total} reviews →
                </div>
              )}
            </div>
          </Link>
        ))}

        <div ref={sentinelRef} style={{ height: "1px" }} />
        {!loading && shownCount < places.length && (
          <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "#aaa" }}>Loading more…</div>
        )}
        {!loading && places.length > 0 && shownCount >= places.length && (
          <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: "#ccc" }}>All reviews shown</div>
        )}
      </div>
    </div>
  )
}