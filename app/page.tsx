"use client"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import FeedMap from "./FeedMap"

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

function getCategoryFromTypes(types: string[]) {
  if (types.includes("fine_dining_restaurant")) return "Fine Dining"
  if (types.includes("italian_restaurant")) return "Italian"
  if (types.includes("mexican_restaurant")) return "Mexican"
  if (types.includes("chinese_restaurant") || types.includes("japanese_restaurant") || types.includes("asian_restaurant")) return "Asian"
  if (types.includes("sushi_restaurant")) return "Sushi"
  if (types.includes("thai_restaurant")) return "Thai"
  if (types.includes("indian_restaurant")) return "Indian"
  if (types.includes("greek_restaurant")) return "Greek"
  if (types.includes("mediterranean_restaurant")) return "Mediterranean"
  if (types.includes("french_restaurant")) return "French"
  if (types.includes("american_restaurant")) return "American"
  if (types.includes("pizza_restaurant")) return "Pizza"
  if (types.includes("burger_restaurant") || types.includes("hamburger_restaurant")) return "Burgers"
  if (types.includes("sandwich_shop")) return "Sandwiches"
  if (types.includes("seafood_restaurant")) return "Seafood"
  if (types.includes("steak_house")) return "Steakhouse"
  if (types.includes("barbecue_restaurant")) return "BBQ"
  if (types.includes("breakfast_restaurant") || types.includes("brunch_restaurant")) return "Breakfast"
  if (types.includes("fast_food_restaurant")) return "Fast Food"
  if (types.includes("vegetarian_restaurant") || types.includes("vegan_restaurant")) return "Vegetarian"
  if (types.includes("brewery") || types.includes("brewpub")) return "Brewery"
  if (types.includes("bar") || types.includes("cocktail_bar") || types.includes("wine_bar")) return "Bar"
  if (types.includes("night_club")) return "Night Club"
  if (types.includes("cafe") || types.includes("coffee_shop")) return "Cafe"
  if (types.includes("bakery")) return "Bakery"
  if (types.includes("ice_cream_shop")) return "Ice Cream"
  if (types.includes("dessert_shop")) return "Desserts"
  if (types.includes("grocery_store") || types.includes("supermarket")) return "Grocery"
  if (types.includes("convenience_store")) return "Convenience Store"
  if (types.includes("clothing_store")) return "Clothing"
  if (types.includes("shoe_store")) return "Shoes"
  if (types.includes("jewelry_store")) return "Jewelry"
  if (types.includes("book_store") || types.includes("bookstore")) return "Books"
  if (types.includes("electronics_store")) return "Electronics"
  if (types.includes("shopping_mall")) return "Shopping Mall"
  if (types.includes("pharmacy") || types.includes("drug_store") || types.includes("drugstore")) return "Pharmacy"
  if (types.includes("gym") || types.includes("fitness_center")) return "Gym"
  if (types.includes("spa")) return "Spa"
  if (types.includes("hair_care") || types.includes("hair_salon")) return "Hair Salon"
  if (types.includes("nail_salon")) return "Nail Salon"
  if (types.includes("barber_shop")) return "Barbershop"
  if (types.includes("beauty_salon")) return "Beauty Salon"
  if (types.includes("dentist")) return "Dentist"
  if (types.includes("doctor") || types.includes("medical_clinic")) return "Medical"
  if (types.includes("hospital")) return "Hospital"
  if (types.includes("movie_theater")) return "Movie Theater"
  if (types.includes("museum")) return "Museum"
  if (types.includes("art_gallery")) return "Art Gallery"
  if (types.includes("hotel") || types.includes("lodging")) return "Hotel"
  if (types.includes("bank")) return "Bank"
  if (types.includes("gas_station")) return "Gas Station"
  if (types.includes("car_wash")) return "Car Wash"
  if (types.includes("car_repair") || types.includes("auto_repair")) return "Auto Repair"
  if (types.includes("laundry") || types.includes("laundromat")) return "Laundry"
  if (types.includes("restaurant")) return "Restaurant"
  if (types.includes("food")) return "Food & Drink"
  if (types.includes("store")) return "Shop"
  return "Place"
}

const FILTERS = [
  {
    key: "food",
    label: "Food & Drink",
    types: [
      "restaurant", "cafe", "bar", "coffee_shop", "bakery", "night_club",
      "brewery", "food_court", "ice_cream_shop", "dessert_shop",
      "meal_delivery", "meal_takeaway", "fine_dining_restaurant",
      "fast_food_restaurant", "pizza_restaurant", "hamburger_restaurant",
      "seafood_restaurant", "steak_house", "sushi_restaurant",
    ],
  },
  {
    key: "hotels",
    label: "Hotels",
    types: ["hotel", "lodging", "hostel", "motel", "bed_and_breakfast", "resort_hotel", "extended_stay_hotel"],
  },
  {
    key: "health",
    label: "Health & Beauty",
    types: [
      "gym", "fitness_center", "spa", "hair_salon", "nail_salon",
      "barber_shop", "beauty_salon", "pharmacy", "dentist", "doctor",
      "hospital", "physiotherapist", "yoga_studio",
    ],
  },
  {
    key: "services",
    label: "Services",
    types: [
      "bank", "gas_station", "car_wash", "car_repair", "laundry",
      "post_office", "library", "grocery_store", "supermarket",
      "convenience_store", "atm", "car_dealer", "insurance_agency",
    ],
  },
  { key: "all", label: "All", types: [] },
]

const MAX_RADIUS = 30

function PlaceCard({ place }: { place: any }) {
  const photo = place.photos?.[0] ? getPhotoUrl(place.photos[0].name) : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
  const category = getCategoryFromTypes(place.types || [])
  const isOpen = place.currentOpeningHours?.openNow
  const dist = place.distance
  return (
    <Link href={`/search/${place.id}`} style={{ textDecoration: "none", display: "flex", gap: "14px", alignItems: "center", padding: "14px 1.25rem", borderBottom: "1px solid #eee", background: "white" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "14px", overflow: "hidden", flexShrink: 0, background: "#f0f0f0" }}>
        <img src={photo} alt={place.displayName?.text} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{place.displayName?.text}</div>
        <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>{category}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isOpen !== undefined && (
            <span style={{ fontSize: "11px", fontWeight: "600", color: isOpen ? "#3B6D11" : "#A32D2D" }}>
              {isOpen ? "Open" : "Closed"}
            </span>
          )}
          {dist < 999 && (
            <span style={{ fontSize: "11px", color: "#aaa" }}>{dist < 0.1 ? "Here" : `${dist.toFixed(1)} mi`}</span>
          )}
        </div>
      </div>
      <span style={{ color: "#ccc", fontSize: "20px", flexShrink: 0 }}>›</span>
    </Link>
  )
}

export default function Home() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState(false)
  const [cityInput, setCityInput] = useState("")
  const [lookingUpCity, setLookingUpCity] = useState(false)
  const [cityError, setCityError] = useState("")
  const [activeFilter, setActiveFilter] = useState("food")
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [places, setPlaces] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [radius, setRadius] = useState(3)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const seenIdsRef = useRef(new Set<string>())
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { setLocationError(true); setLoading(false) }
    )
  }, [])

  useEffect(() => {
    if (!location) return
    initialLoad(location, activeFilter)
  }, [location, activeFilter])

  async function lookupCity() {
    const q = cityInput.trim()
    if (!q) return
    setLookingUpCity(true)
    setCityError("")
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q + " city" }),
      })
      const data = await res.json()
      console.log("CITY LOOKUP RESULT:", data)
      const first = (data.places || [])[0]
      if (first?.location) {
        setLocationError(false)
        setLoading(true)
        setLocation({ lat: first.location.latitude, lng: first.location.longitude })
      } else {
        setCityError("Couldn't find that place. Try another city name.")
      }
    } catch {
      setCityError("Something went wrong. Try again.")
    }
    setLookingUpCity(false)
  }

  function getFilterTypes(filterKey: string) {
    return FILTERS.find(f => f.key === filterKey)?.types ?? []
  }

  async function initialLoad(loc: { lat: number; lng: number }, filterKey: string) {
    setLoading(true)
    seenIdsRef.current = new Set()
    setPlaces([])
    setRadius(3)

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const types = getFilterTypes(filterKey)
    const typesParam = types.length > 0 ? `&types=${types.join(",")}` : ""

    const [placesRes, reviewRes] = await Promise.all([
      fetch(`/api/places?lat=${loc.lat}&lng=${loc.lng}&radius=${3 * 1609}${typesParam}`),
      supabase.from("reviews").select("*, businesses(name, category, cover_url, latitude, longitude)").eq("status", "published").order("created_at", { ascending: false }).limit(30),
    ])

    const placesData = await placesRes.json()
    const loaded = (placesData.places || [])
      .map((p: any) => ({ ...p, distance: p.location ? getDistance(loc.lat, loc.lng, p.location.latitude, p.location.longitude) : 999 }))
      .sort((a: any, b: any) => a.distance - b.distance)

    loaded.forEach((p: any) => seenIdsRef.current.add(p.id))
    setPlaces(loaded)
    setReviews(reviewRes.data || [])
    setLoading(false)
  }

  async function loadMore() {
    if (!location || loadingMore) return
    const nextRadius = radius + 3
    if (nextRadius > MAX_RADIUS) return
    setLoadingMore(true)
    const types = getFilterTypes(activeFilter)
    const typesParam = types.length > 0 ? `&types=${types.join(",")}` : ""
    const minRadiusMeters = radius * 1609
    const maxRadiusMeters = nextRadius * 1609
    try {
      const res = await fetch(`/api/places?lat=${location.lat}&lng=${location.lng}&radius=${maxRadiusMeters}&minRadius=${minRadiusMeters}${typesParam}`)
      const data = await res.json()
      const newPlaces = (data.places || [])
        .filter((p: any) => !seenIdsRef.current.has(p.id))
        .map((p: any) => ({ ...p, distance: p.location ? getDistance(location.lat, location.lng, p.location.latitude, p.location.longitude) : 999 }))
        .sort((a: any, b: any) => a.distance - b.distance)
      newPlaces.forEach((p: any) => seenIdsRef.current.add(p.id))
      setPlaces(prev => [...prev, ...newPlaces])
      setRadius(nextRadius)
    } catch (e) {
      console.error("loadMore error", e)
    } finally {
      setLoadingMore(false)
    }
  }

  function handleSearch(text: string) {
    setSearch(text)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (!text.trim()) { setSearchResults([]); setSearching(false); return }
    setSearching(true)
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text, lat: location?.lat, lng: location?.lng }),
        })
        const data = await res.json()
        setSearchResults((data.places || []).map((p: any) => ({
          ...p,
          distance: p.location && location ? getDistance(location.lat, location.lng, p.location.latitude, p.location.longitude) : 999,
        })))
      } catch { setSearchResults([]) }
      setSearching(false)
    }, 400)
  }

  const isSearching = search.trim().length > 0

  const feedItems: any[] = []
  if (!isSearching && location) {
    reviews.forEach((review: any) => {
      const biz = review.businesses
      let dist = 999
      if (biz?.latitude && biz?.longitude) {
        dist = getDistance(location.lat, location.lng, parseFloat(biz.latitude), parseFloat(biz.longitude))
        if (dist > radius) return
      }
      feedItems.push({ type: "review", review, distance: dist })
    })
    places.forEach((place: any) => feedItems.push({ type: "google_place", place, distance: place.distance }))
    feedItems.sort((a, b) => a.distance - b.distance)
  }

  const mapPoints = feedItems
    .map((it: any) => {
      if (it.type === "google_place" && it.place.location) {
        return { id: it.place.id, name: it.place.displayName?.text || "Place", lat: it.place.location.latitude, lng: it.place.location.longitude, href: `/search/${it.place.id}` }
      }
      if (it.type === "review" && it.review.businesses?.latitude && it.review.businesses?.longitude) {
        return { id: `r-${it.review.id}`, name: it.review.businesses?.name || "Place", lat: parseFloat(it.review.businesses.latitude), lng: parseFloat(it.review.businesses.longitude), href: `/business/${it.review.business_id}` }
      }
      return null
    })
    .filter(Boolean) as any[]

  // Location denied and no city chosen yet — ask for a city
  if (locationError && !location) {
    return (
      <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>📍</div>
        <div style={{ fontSize: "20px", fontWeight: "700", color: "#111", marginBottom: "8px", textAlign: "center" }}>Where are you?</div>
        <div style={{ fontSize: "14px", color: "#888", marginBottom: "24px", textAlign: "center", lineHeight: "1.5" }}>
          Enter your city so we can show you what's nearby.
        </div>
        <input
          type="text"
          value={cityInput}
          onChange={e => setCityInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") lookupCity() }}
          placeholder="e.g. London, Los Angeles, Tokyo"
          style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "15px", background: "white", boxSizing: "border-box", marginBottom: "12px", outline: "none" }}
        />
        {cityError && <div style={{ fontSize: "13px", color: "#A32D2D", marginBottom: "12px" }}>{cityError}</div>}
        <button
          onClick={lookupCity}
          disabled={lookingUpCity || !cityInput.trim()}
          style={{ width: "100%", background: cityInput.trim() ? "#534AB7" : "#bbb", color: "white", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", border: "none", cursor: cityInput.trim() ? "pointer" : "not-allowed" }}
        >
          {lookingUpCity ? "Finding..." : "Show me places"}
        </button>
      </div>
    )
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
          <img src={selectedPhoto} alt="" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "12px", objectFit: "contain" }} onClick={e => e.stopPropagation()} />
        </div>
      )}

      <div style={{ background: "#534AB7" }}>
        <div style={{ padding: "1rem 1.25rem 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "white", letterSpacing: "-0.5px" }}>Reviu</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginTop: "1px" }}>
              {isSearching ? "Global search" : `Within ${radius} mi`}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link href="/post-review" style={{ background: "rgba(255,255,255,0.18)", color: "white", fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "20px", textDecoration: "none" }}>
              + Review
            </Link>
            <Link href="/profile" style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              <span style={{ fontSize: "16px", color: "white" }}>◯</span>
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", overflowX: "auto", padding: "12px 1.25rem 0", scrollbarWidth: "none" }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => { setActiveFilter(f.key); setSearch(""); setSearchResults([]) }}
              style={{ flexShrink: 0, padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "none", outline: "none",
                background: activeFilter === f.key && !isSearching ? "white" : "rgba(255,255,255,0.18)",
                color: activeFilter === f.key && !isSearching ? "#534AB7" : "white" }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "10px 1.25rem 14px", position: "relative" }}>
          <span style={{ position: "absolute", left: "calc(1.25rem + 12px)", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none", color: "rgba(255,255,255,0.5)" }}>🔍</span>
          <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search any place worldwide..."
            style={{ width: "100%", padding: "10px 40px 10px 36px", borderRadius: "12px", border: "none", fontSize: "14px", background: "rgba(255,255,255,0.15)", color: "white", boxSizing: "border-box", outline: "none" }} />
          {searching && <span style={{ position: "absolute", right: "calc(1.25rem + 12px)", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Searching…</span>}
          {isSearching && !searching && (
            <span onClick={() => { setSearch(""); setSearchResults([]) }}
              style={{ position: "absolute", right: "calc(1.25rem + 12px)", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "rgba(255,255,255,0.6)", cursor: "pointer", lineHeight: 1 }}>✕</span>
          )}
        </div>
      </div>

      {!isSearching && mapPoints.length > 0 && (
        <FeedMap center={location} points={mapPoints} />
      )}

      <div>
        {isSearching && !searching && searchResults.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 1.25rem" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</div>
            <div style={{ fontSize: "14px", color: "#888" }}>No results for "{search}"</div>
          </div>
        )}
        {isSearching && searchResults.map((place) => <PlaceCard key={place.id} place={place} />)}

        {!isSearching && feedItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 1.25rem" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📍</div>
            <div style={{ fontSize: "14px", color: "#888" }}>Nothing nearby yet</div>
          </div>
        )}

        {!isSearching && feedItems.map((item) => {
          if (item.type === "review") {
            const review = item.review
            return (
              <div key={`review-${review.id}`} style={{ padding: "16px 1.25rem", borderBottom: "1px solid #eee", background: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#534AB7", flexShrink: 0 }}>
                    {review.reviewer_initials || "R"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{review.reviewer_name}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>
                      reviewed <Link href={`/business/${review.business_id}`} style={{ color: "#534AB7", textDecoration: "none", fontWeight: "600" }}>{review.businesses?.name}</Link>
                      {" · "}{new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} style={{ fontSize: "11px", color: s <= review.stars ? "#534AB7" : "#e0e0e0" }}>✦</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: "14px", color: "#333", lineHeight: "1.6", marginBottom: review.media_urls?.length > 0 ? "12px" : 0 }}>
                  {review.text?.slice(0, 220)}{review.text?.length > 220 ? "…" : ""}
                </div>
                {review.media_urls?.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginLeft: "-1.25rem", paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "4px" }}>
                    {review.media_urls.map((url: string, i: number) => (
                      <img key={i} src={url} alt="" onClick={() => setSelectedPhoto(url)} style={{ width: "110px", height: "110px", objectFit: "cover", borderRadius: "10px", flexShrink: 0, cursor: "pointer" }} />
                    ))}
                  </div>
                )}
              </div>
            )
          }

          if (item.type === "google_place") {
            return <PlaceCard key={`place-${item.place.id}`} place={item.place} />
          }

          return null
        })}

        {!isSearching && (
          <div style={{ padding: "20px 1.25rem", textAlign: "center" }}>
            {loadingMore ? (
              <div style={{ fontSize: "13px", color: "#aaa" }}>Loading…</div>
            ) : radius >= MAX_RADIUS ? (
              <div style={{ fontSize: "13px", color: "#ccc" }}>All spots within {MAX_RADIUS} miles shown</div>
            ) : (
              <button onClick={loadMore}
                style={{ background: "white", border: "1.5px solid #534AB7", color: "#534AB7", fontSize: "13px", fontWeight: "600", padding: "10px 24px", borderRadius: "20px", cursor: "pointer" }}>
                Load more · expand to {radius + 3} mi
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}