"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

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
  if (types.includes("pharmacy") || types.includes("drug_store") || types.includes("drugstore")) return "Pharmacy"
  if (types.includes("gym") || types.includes("fitness_center")) return "Gym"
  if (types.includes("spa")) return "Spa"
  if (types.includes("hair_salon") || types.includes("hair_care")) return "Hair Salon"
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

const RADIUS_STEPS = [3, 5, 10]

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
          {place.rating && <span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "700" }}>✦ {place.rating}</span>}
          {isOpen !== undefined && (
            <span style={{ fontSize: "11px", fontWeight: "600", color: isOpen ? "#3B6D11" : "#A32D2D" }}>{isOpen ? "Open" : "Closed"}</span>
          )}
          {dist < 999 && <span style={{ fontSize: "11px", color: "#aaa" }}>{dist < 0.1 ? "Here" : `${dist.toFixed(1)} mi`}</span>}
        </div>
      </div>
      <span style={{ color: "#ccc", fontSize: "20px", flexShrink: 0 }}>›</span>
    </Link>
  )
}

export default function ReviewsPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState(false)
  const [activeFilter, setActiveFilter] = useState("food")
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [allPlaces, setAllPlaces] = useState<any[]>([])
  const [radius, setRadius] = useState(RADIUS_STEPS[0])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const seenIdsRef = useRef(new Set<string>())
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingMoreRef = useRef(false)
  const hasMoreRef = useRef(true)
  const radiusRef = useRef(RADIUS_STEPS[0])
  const activeFilterRef = useRef("food")
  const locationRef = useRef<{ lat: number; lng: number } | null>(null)
  const searchRef = useRef("")
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { hasMoreRef.current = hasMore }, [hasMore])
  useEffect(() => { radiusRef.current = radius }, [radius])
  useEffect(() => { activeFilterRef.current = activeFilter }, [activeFilter])
  useEffect(() => { locationRef.current = location }, [location])
  useEffect(() => { searchRef.current = search }, [search])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { setLocationError(true); setLocation({ lat: 39.1031, lng: -84.5120 }) }
    )
  }, [])

  useEffect(() => {
    if (!location) return
    initialLoad(location, activeFilter)
  }, [location, activeFilter])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting) return
        if (loadingMoreRef.current || !hasMoreRef.current || !locationRef.current || searchRef.current.trim()) return
        loadMore()
      },
      { rootMargin: "200px", threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function getFilterTypes(filterKey: string) {
    return FILTERS.find(f => f.key === filterKey)?.types ?? []
  }

  async function initialLoad(loc: { lat: number; lng: number }, filterKey: string) {
    setLoading(true)
    setLoadingMore(false)
    loadingMoreRef.current = false
    seenIdsRef.current = new Set()
    setAllPlaces([])
    setRadius(RADIUS_STEPS[0])
    radiusRef.current = RADIUS_STEPS[0]
    setHasMore(true)
    hasMoreRef.current = true

    const types = getFilterTypes(filterKey)
    const typesParam = types.length > 0 ? `&types=${types.join(",")}` : ""

    try {
      const res = await fetch(`/api/places?lat=${loc.lat}&lng=${loc.lng}&radius=${RADIUS_STEPS[0] * 1609}${typesParam}`)
      const data = await res.json()
      const places = (data.places || [])
        .map((p: any) => ({ ...p, distance: p.location ? getDistance(loc.lat, loc.lng, p.location.latitude, p.location.longitude) : 999 }))
        .sort((a: any, b: any) => a.distance - b.distance)
      places.forEach((p: any) => seenIdsRef.current.add(p.id))
      setAllPlaces(places)
      const more = places.length >= 18
      setHasMore(more)
      hasMoreRef.current = more
    } catch { /* silent */ }

    setLoading(false)
  }

  async function loadMore() {
    if (loadingMoreRef.current || !hasMoreRef.current || !locationRef.current || searchRef.current.trim()) return
    const currentIndex = RADIUS_STEPS.indexOf(radiusRef.current)
    if (currentIndex < 0 || currentIndex >= RADIUS_STEPS.length - 1) {
      setHasMore(false); hasMoreRef.current = false; return
    }
    const nextRadius = RADIUS_STEPS[currentIndex + 1]

    loadingMoreRef.current = true
    setLoadingMore(true)

    const types = getFilterTypes(activeFilterRef.current)
    const typesParam = types.length > 0 ? `&types=${types.join(",")}` : ""
    const loc = locationRef.current!

    try {
      const res = await fetch(`/api/places?lat=${loc.lat}&lng=${loc.lng}&radius=${nextRadius * 1609}${typesParam}`)
      const data = await res.json()
      const newPlaces = (data.places || [])
        .filter((p: any) => !seenIdsRef.current.has(p.id))
        .map((p: any) => ({ ...p, distance: p.location ? getDistance(loc.lat, loc.lng, p.location.latitude, p.location.longitude) : 999 }))
        .sort((a: any, b: any) => a.distance - b.distance)
      newPlaces.forEach((p: any) => seenIdsRef.current.add(p.id))
      setAllPlaces(prev => [...prev, ...newPlaces])
    } catch { /* silent */ }

    setRadius(nextRadius)
    radiusRef.current = nextRadius
    const more = nextRadius < RADIUS_STEPS[RADIUS_STEPS.length - 1]
    setHasMore(more)
    hasMoreRef.current = more
    loadingMoreRef.current = false
    setLoadingMore(false)
  }

  function handleSearch(text: string) {
    setSearch(text)
    searchRef.current = text
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (!text.trim()) { setSearchResults([]); setSearching(false); return }
    setSearching(true)
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const loc = locationRef.current
        const res = await fetch("/api/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text, lat: loc?.lat, lng: loc?.lng }),
        })
        const data = await res.json()
        setSearchResults((data.places || []).map((p: any) => ({
          ...p,
          distance: p.location && loc ? getDistance(loc.lat, loc.lng, p.location.latitude, p.location.longitude) : 999,
        })))
      } catch { setSearchResults([]) }
      setSearching(false)
    }, 400)
  }

  const isSearching = search.trim().length > 0

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>✦</div>
        <div style={{ color: "#888", fontSize: "14px" }}>Finding businesses near you…</div>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>

      {/* Purple header */}
      <div style={{ background: "#534AB7" }}>
        <div style={{ padding: "1rem 1.25rem 0" }}>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "white", letterSpacing: "-0.5px" }}>Search</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginTop: "1px" }}>
            {isSearching ? "Global search" : locationError ? "Cincinnati, OH" : `Within ${radius} mi of you`}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", padding: "12px 1.25rem 0", scrollbarWidth: "none" }}>
          <style>{`
            input::placeholder { color: rgba(255,255,255,0.5) !important; }
          `}</style>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => { setActiveFilter(f.key); setSearch(""); setSearchResults([]) }}
              style={{ flexShrink: 0, padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "none", outline: "none",
                background: activeFilter === f.key && !isSearching ? "white" : "rgba(255,255,255,0.18)",
                color: activeFilter === f.key && !isSearching ? "#534AB7" : "white" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ padding: "10px 1.25rem 14px", position: "relative" }}>
          <span style={{ position: "absolute", left: "calc(1.25rem + 12px)", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none", color: "rgba(255,255,255,0.5)" }}>🔍</span>
          <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search any place worldwide..."
            style={{ width: "100%", padding: "10px 40px 10px 36px", borderRadius: "12px", border: "none", fontSize: "14px", background: "rgba(255,255,255,0.15)", color: "white", boxSizing: "border-box", outline: "none" }} />
          {searching && <span style={{ position: "absolute", right: "calc(1.25rem + 12px)", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Searching…</span>}
          {isSearching && !searching && (
            <span onClick={() => { setSearch(""); searchRef.current = ""; setSearchResults([]) }}
              style={{ position: "absolute", right: "calc(1.25rem + 12px)", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "rgba(255,255,255,0.6)", cursor: "pointer", lineHeight: 1 }}>✕</span>
          )}
        </div>
      </div>

      {/* Results */}
      <div>
        {isSearching && !searching && searchResults.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 1.25rem" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</div>
            <div style={{ fontSize: "14px", color: "#888" }}>No results for "{search}"</div>
          </div>
        )}
        {isSearching && searchResults.map(place => <PlaceCard key={place.id} place={place} />)}

        {!isSearching && allPlaces.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "3rem 1.25rem" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📍</div>
            <div style={{ fontSize: "14px", color: "#888" }}>Nothing nearby in this category</div>
          </div>
        )}
        {!isSearching && allPlaces.map(place => <PlaceCard key={place.id} place={place} />)}

        {/* Sentinel — always rendered */}
        <div ref={sentinelRef} style={{ height: "1px" }} />
        {loadingMore && (
          <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "#aaa" }}>Loading more…</div>
        )}
        {!loadingMore && !hasMore && allPlaces.length > 0 && !isSearching && (
          <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: "#ccc" }}>
            All spots within {radius} miles shown
          </div>
        )}
      </div>
    </div>
  )
}
