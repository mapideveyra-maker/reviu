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

const PAGE_SIZE = 20

export default function ReviewsPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingMoreRef = useRef(false)
  const hasMoreRef = useRef(true)
  const offsetRef = useRef(0)
  const locationRef = useRef<{ lat: number; lng: number } | null>(null)

  useEffect(() => { hasMoreRef.current = hasMore }, [hasMore])
  useEffect(() => { locationRef.current = location }, [location])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: 39.1031, lng: -84.5120 })
    )
  }, [])

  useEffect(() => {
    if (location !== null) loadInitial()
  }, [location]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting) return
        if (loadingMoreRef.current || !hasMoreRef.current) return
        loadMore()
      },
      { rootMargin: "200px", threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchBatch(from: number) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from("reviews")
      .select("*, businesses(name, latitude, longitude)")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1)
    return data || []
  }

  function withDistances(batch: any[]) {
    const loc = locationRef.current
    return batch.map(r => {
      const biz = r.businesses
      if (biz?.latitude && biz?.longitude && loc) {
        return { ...r, _dist: getDistance(loc.lat, loc.lng, parseFloat(biz.latitude), parseFloat(biz.longitude)) }
      }
      return { ...r, _dist: null }
    })
  }

  function sortByDistance(items: any[]) {
    return [...items].sort((a, b) => {
      if (a._dist === null && b._dist === null) return 0
      if (a._dist === null) return 1
      if (b._dist === null) return -1
      return a._dist - b._dist
    })
  }

  async function loadInitial() {
    setLoading(true)
    offsetRef.current = 0
    const batch = await fetchBatch(0)
    const processed = sortByDistance(withDistances(batch))
    setReviews(processed)
    offsetRef.current = batch.length
    const more = batch.length === PAGE_SIZE
    setHasMore(more)
    hasMoreRef.current = more
    setLoading(false)
  }

  async function loadMore() {
    if (loadingMoreRef.current || !hasMoreRef.current) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    const from = offsetRef.current
    const batch = await fetchBatch(from)
    const processed = sortByDistance(withDistances(batch))
    setReviews(prev => [...prev, ...processed])
    offsetRef.current = from + batch.length
    const more = batch.length === PAGE_SIZE
    setHasMore(more)
    hasMoreRef.current = more
    loadingMoreRef.current = false
    setLoadingMore(false)
  }

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>✦</div>
        <div style={{ color: "#888", fontSize: "14px" }}>Loading reviews near you…</div>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>

      <div style={{ background: "#534AB7", padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: "22px", fontWeight: "700", color: "white", letterSpacing: "-0.5px" }}>Reviews</div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginTop: "2px" }}>Real experiences from Reviu members</div>
      </div>

      <div>
        {reviews.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 1.25rem" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>◈</div>
            <div style={{ fontSize: "14px", color: "#888", marginBottom: "16px" }}>No reviews yet — be the first!</div>
            <Link href="/post-review" style={{ display: "inline-block", background: "#534AB7", color: "white", padding: "12px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
              Write a review
            </Link>
          </div>
        )}

        {reviews.map(review => {
          const bizName = review.businesses?.name
          const bizHref = review.business_id
            ? `/business/${review.business_id}`
            : review.google_place_id
            ? `/search/${review.google_place_id}`
            : null
          const dist = review._dist
          const bg = avatarColor(review.reviewer_name || "?")

          return (
            <div key={review.id} style={{ background: "white", padding: "16px 1.25rem", borderBottom: "1px solid #eee" }}>

              {/* Reviewer header */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: "white", flexShrink: 0, letterSpacing: "0.5px" }}>
                  {review.reviewer_initials || "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>
                    {review.reviewer_name || "Anonymous"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>
                    {formatDate(review.created_at)}
                    {dist !== null && dist < 50 && (
                      <span> · {dist < 0.1 ? "Here" : `${dist.toFixed(1)} mi away`}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "2px", flexShrink: 0, alignItems: "center" }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ fontSize: "13px", color: s <= review.stars ? "#534AB7" : "#e0e0e0" }}>✦</span>
                  ))}
                </div>
              </div>

              {/* Business tag */}
              {(bizName || review.google_place_id) && (
                <div style={{ marginBottom: "8px" }}>
                  {bizHref ? (
                    <Link href={bizHref} style={{ textDecoration: "none" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#EEEDFE", color: "#534AB7", fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>
                        📍 {bizName || "View place"}
                        {review.context_tag && <span style={{ color: "#9990D9", fontWeight: "400" }}> · {review.context_tag}</span>}
                      </span>
                    </Link>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#EEEDFE", color: "#534AB7", fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>
                      📍 {bizName || "Place"}
                    </span>
                  )}
                </div>
              )}

              {/* Review text */}
              <div style={{ fontSize: "14px", color: "#333", lineHeight: "1.65", marginBottom: review.media_urls?.length > 0 ? "12px" : "0" }}>
                {review.text?.slice(0, 300)}{review.text?.length > 300 ? "…" : ""}
              </div>

              {/* Media */}
              {review.media_urls?.length > 0 && (
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginLeft: "-1.25rem", paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "4px" }}>
                  {review.media_urls.slice(0, 5).map((url: string, i: number) => (
                    <img key={i} src={url} alt="" style={{ width: "88px", height: "88px", objectFit: "cover", borderRadius: "10px", flexShrink: 0 }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Sentinel — always rendered so observer fires when loading becomes false */}
        <div ref={sentinelRef} style={{ height: "1px" }} />
        {loadingMore && (
          <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "#aaa" }}>Loading more…</div>
        )}
        {!hasMore && reviews.length > 0 && !loadingMore && (
          <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: "#ccc" }}>All reviews shown</div>
        )}
      </div>
    </div>
  )
}
