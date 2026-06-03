"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
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
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getPhotoUrl(photoName: string) {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
}

export default function ReviewsPage() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState(false)
  const [radius, setRadius] = useState(3)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [placeResults, setPlaceResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    supabase.from("businesses").select("*").then(({ data }) => {
      const all = data || []
      const nearby = all.filter(b => {
        if (!b.latitude || !b.longitude) return true
        return getDistance(location.lat, location.lng, parseFloat(b.latitude), parseFloat(b.longitude)) <= radius
      })
      setBusinesses(nearby)
      setLoading(false)
    })
  }, [location, radius])

  function handleSearch(text: string) {
    setSearch(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!text.trim()) {
      setPlaceResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: text,
            lat: location?.lat,
            lng: location?.lng,
          }),
        })
        const data = await res.json()
        setPlaceResults(data.places || [])
      } catch {
        setPlaceResults([])
      }
      setSearching(false)
    }, 400)
  }

  const filtered = search
    ? businesses.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.category?.toLowerCase().includes(search.toLowerCase()) ||
        b.city?.toLowerCase().includes(search.toLowerCase())
      )
    : businesses

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>✦</div>
        <div style={{ color: "#888", fontSize: "14px" }}>Finding businesses near you...</div>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>

      <div style={{ background: "#534AB7", padding: "1rem 1.25rem 0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>Search</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
              {locationError ? "Cincinnati, OH" : `Within ${radius} miles of you`}
            </div>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search any business worldwide..."
            style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", border: "none", fontSize: "14px", background: "rgba(255,255,255,0.15)", color: "white", boxSizing: "border-box", outline: "none" }}
          />
          {searching && (
            <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>
              Searching...
            </div>
          )}
        </div>
        <style>{`::placeholder { color: rgba(255,255,255,0.6); }`}</style>
      </div>

      <div>
        {/* Google Places search results */}
        {search.trim() && (
          <>
            {placeResults.length > 0 && (
              <>
                <div style={{ padding: "10px 1.25rem 6px", fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Places worldwide
                </div>
                {placeResults.map(place => {
                  const photo = place.photos?.[0] ? getPhotoUrl(place.photos[0].name) : categoryPhotos.default
                  const isOpen = place.currentOpeningHours?.openNow
                  return (
                    <Link key={place.id} href={`/search/${place.id}`} style={{ textDecoration: "none", display: "flex", gap: "14px", alignItems: "center", padding: "12px 1.25rem", borderBottom: "1px solid #eee", background: "white" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
                        <img src={photo} alt={place.displayName?.text} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{place.displayName?.text}</div>
                        <div style={{ fontSize: "12px", color: "#888", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{place.formattedAddress}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {place.rating && (
                            <span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>✦ {place.rating}</span>
                          )}
                          {isOpen !== undefined && (
                            <span style={{ fontSize: "10px", color: isOpen ? "#3B6D11" : "#A32D2D", fontWeight: "600" }}>
                              {isOpen ? "Open" : "Closed"}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ color: "#ddd", fontSize: "18px", flexShrink: 0 }}>›</span>
                    </Link>
                  )
                })}
              </>
            )}

            {/* Matching Reviu businesses */}
            {filtered.length > 0 && (
              <>
                <div style={{ padding: "10px 1.25rem 6px", fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  On Reviu
                </div>
                {filtered.map(biz => (
                  <Link key={biz.id} href={`/business/${biz.id}`} style={{ textDecoration: "none", display: "block", borderBottom: "1px solid #eee" }}>
                    <div style={{ position: "relative", height: "160px" }}>
                      <img src={biz.cover_url || categoryPhotos[biz.category] || categoryPhotos.default} alt={biz.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)" }} />
                      <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "white", marginBottom: "2px" }}>{biz.name}</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>{biz.category} · {biz.city}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            )}

            {!searching && placeResults.length === 0 && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 1.25rem" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
                <div style={{ fontSize: "14px", color: "#888" }}>No results for "{search}"</div>
              </div>
            )}
          </>
        )}

        {/* Default: nearby Reviu businesses */}
        {!search.trim() && (
          <>
            {businesses.length === 0 && !loading && (
              <div style={{ textAlign: "center", padding: "3rem 1.25rem" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📍</div>
                <div style={{ fontSize: "14px", color: "#888", marginBottom: "12px" }}>
                  No businesses within {radius} miles yet
                </div>
                {radius < 10 && (
                  <div onClick={() => setRadius(r => r === 3 ? 5 : 10)} style={{ fontSize: "13px", color: "#534AB7", fontWeight: "600", cursor: "pointer" }}>
                    Expand to {radius === 3 ? 5 : 10} miles →
                  </div>
                )}
              </div>
            )}

            {businesses.map(biz => (
              <Link key={biz.id} href={`/business/${biz.id}`} style={{ textDecoration: "none", display: "block", borderBottom: "1px solid #eee" }}>
                <div style={{ position: "relative", height: "200px" }}>
                  <img src={biz.cover_url || categoryPhotos[biz.category] || categoryPhotos.default} alt={biz.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)" }} />
                  {biz.special_today && (
                    <div style={{ position: "absolute", top: "12px", left: "12px", background: "#534AB7", color: "white", fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" }}>✦ SPECIAL TODAY</div>
                  )}
                  <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
                    <div style={{ fontSize: "17px", fontWeight: "700", color: "white", marginBottom: "3px" }}>{biz.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>{biz.category} · {biz.city}</span>
                      <span style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "10px" }}>
                        {"✦".repeat(Math.round(biz.google_rating || 0))} {biz.google_rating}
                      </span>
                      {!biz.claimed && <span style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "10px" }}>Unclaimed</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {businesses.length > 0 && radius < 10 && (
              <div onClick={() => setRadius(r => r === 3 ? 5 : 10)} style={{ textAlign: "center", padding: "20px", fontSize: "13px", color: "#534AB7", fontWeight: "600", cursor: "pointer" }}>
                Show more within {radius === 3 ? 5 : 10} miles →
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
