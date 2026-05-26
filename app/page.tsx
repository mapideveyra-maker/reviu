"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function getPhotoUrl(photoName: string) {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
}

function getCategoryFromTypes(types: string[]) {
  if (types.includes("fine_dining_restaurant")) return "Fine Dining"
  if (types.includes("italian_restaurant")) return "Italian Restaurant"
  if (types.includes("mexican_restaurant")) return "Mexican Restaurant"
  if (types.includes("chinese_restaurant") || types.includes("japanese_restaurant") || types.includes("asian_restaurant")) return "Asian Restaurant"
  if (types.includes("pizza_restaurant")) return "Pizza"
  if (types.includes("burger_restaurant") || types.includes("hamburger_restaurant")) return "Burgers"
  if (types.includes("brewery") || types.includes("brewpub")) return "Brewery"
  if (types.includes("bar") || types.includes("cocktail_bar")) return "Bar"
  if (types.includes("cafe") || types.includes("coffee_shop")) return "Cafe"
  if (types.includes("breakfast_restaurant")) return "Breakfast"
  if (types.includes("fast_food_restaurant")) return "Fast Food"
  if (types.includes("steak_house")) return "Steakhouse"
  if (types.includes("seafood_restaurant")) return "Seafood"
  return "Restaurant"
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
    loadFeed()
  }, [location, radius])

  async function loadFeed() {
    setLoading(true)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const radiusMeters = radius * 1609

    const [placesRes, reviewRes, specialsRes] = await Promise.all([
      fetch(`/api/places?lat=${location!.lat}&lng=${location!.lng}&radius=${radiusMeters}`),
      supabase.from("reviews").select("*, businesses(name, category, cover_url, latitude, longitude)").eq("status", "published").order("created_at", { ascending: false }).limit(30),
      supabase.from("businesses").select("*").not("special_today", "is", null),
    ])

    const placesData = await placesRes.json()
    const googlePlaces = placesData.places || []
    const reviews = reviewRes.data || []
    const specials = specialsRes.data || []

    const items: any[] = []

    specials.forEach((biz: any) => {
      items.push({ type: "special", biz, createdAt: biz.updated_at || biz.created_at })
    })

    reviews.forEach((review: any) => {
      const biz = review.businesses
      if (!biz?.latitude || !biz?.longitude) {
        items.push({ type: "review", review, createdAt: review.created_at })
        return
      }
      const dist = getDistance(location!.lat, location!.lng, parseFloat(biz.latitude), parseFloat(biz.longitude))
      if (dist <= radius) {
        items.push({ type: "review", review, createdAt: review.created_at })
      }
    })

    googlePlaces.forEach((place: any) => {
      items.push({ type: "google_place", place, createdAt: new Date().toISOString() })
    })

    items.sort((a, b) => {
      const order: Record<string, number> = { special: 0, review: 1, google_place: 2 }
      if (order[a.type] !== order[b.type]) return order[a.type] - order[b.type]
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setFeedItems(items)
    setLoading(false)
  }

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

        {feedItems.map((item, index) => {

          if (item.type === "special") {
            const biz = item.biz
            return (
              <Link key={`special-${biz.id}`} href={`/business/${biz.id}`} style={{ textDecoration: "none", display: "block" }}>
                <div style={{ position: "relative", height: "280px" }}>
                  <img src={biz.special_media_url || biz.cover_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"} alt={biz.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

          if (item.type === "google_place") {
            const place = item.place
            const photo = place.photos?.[0] ? getPhotoUrl(place.photos[0].name) : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
            const category = getCategoryFromTypes(place.types || [])
            const isOpen = place.currentOpeningHours?.openNow

            return (
              <Link key={`place-${place.id}`} href={`/search/${place.id}`} style={{ textDecoration: "none", display: "flex", gap: "14px", alignItems: "center", padding: "14px 1.25rem", borderBottom: "1px solid #eee" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "14px", overflow: "hidden", flexShrink: 0 }}>
                  <img src={photo} alt={place.displayName?.text} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginBottom: "3px" }}>{place.displayName?.text}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>{category}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#534AB7" }}>{"✦".repeat(Math.round(place.rating || 0))}</span>
                    <span style={{ fontSize: "11px", color: "#888" }}>{place.rating} ({place.userRatingCount?.toLocaleString()})</span>
                    {isOpen !== undefined && (
                      <span style={{ fontSize: "10px", color: isOpen ? "#3B6D11" : "#A32D2D", fontWeight: "600" }}>
                        {isOpen ? "Open" : "Closed"}
                      </span>
                    )}
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
    </div>
  )
}