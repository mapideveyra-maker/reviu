import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import BackButton from "../../BackButton"
import ReviewsList from "../../ReviewsList"
import ReportButton from "./ReportButton"

async function getGooglePlace(placeId: string) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey!,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,location,rating,userRatingCount,types,photos,currentOpeningHours,priceLevel,internationalPhoneNumber,websiteUri",
      },
    }
  )
  return res.json()
}

async function getReviews(googlePlaceId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("google_place_id", googlePlaceId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
  return data || []
}

function getPhotoUrl(photoName: string) {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
}

function getCategoryFromTypes(types: string[]) {
  if (types.includes("fine_dining_restaurant")) return "Fine Dining"
  if (types.includes("italian_restaurant")) return "Italian Restaurant"
  if (types.includes("mexican_restaurant")) return "Mexican Restaurant"
  if (types.includes("chinese_restaurant") || types.includes("japanese_restaurant")) return "Asian Restaurant"
  if (types.includes("pizza_restaurant")) return "Pizza"
  if (types.includes("brewery") || types.includes("brewpub")) return "Brewery"
  if (types.includes("bar") || types.includes("cocktail_bar")) return "Bar"
  if (types.includes("cafe") || types.includes("coffee_shop")) return "Cafe"
  if (types.includes("steak_house")) return "Steakhouse"
  return "Restaurant"
}

export default async function GooglePlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [place, reviews] = await Promise.all([getGooglePlace(id), getReviews(id)])

  if (!place || place.error) return <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>Place not found</div>

  const accent = "#534AB7"
  const accentLight = "rgba(83,74,183,0.06)"
  const accentMedium = "rgba(83,74,183,0.12)"
  const accentBorder = "rgba(83,74,183,0.2)"
  const category = getCategoryFromTypes(place.types || [])
  const photo = place.photos?.[0] ? getPhotoUrl(place.photos[0].name) : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
  const lat = place.location?.latitude || 39.1031
  const lng = place.location?.longitude || -84.5120
  const isOpen = place.currentOpeningHours?.openNow
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.formattedAddress || "")}`

  const avgReviuRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.stars, 0) / reviews.length).toFixed(1)
    : null

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: accentLight, paddingBottom: "80px" }}>

      <div style={{ position: "relative", marginBottom: "0" }}>
        <div style={{ height: "260px", position: "relative" }}>
          <iframe
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
            width="100%"
            height="100%"
            style={{ border: "none", filter: "saturate(1.1)", display: "block", pointerEvents: "none" }}
            loading="lazy"
          />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }} />
          <BackButton />
        </div>
        <div style={{ position: "absolute", bottom: "-44px", left: "20px", width: "88px", height: "88px", borderRadius: "50%", background: accent, border: "5px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: "700", color: "white", boxShadow: "0 6px 20px rgba(0,0,0,0.2)", zIndex: 30, overflow: "hidden" }}>
          <img src={photo} alt={place.displayName?.text} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>

      <div style={{ background: "white", padding: "56px 1.25rem 1.25rem", marginBottom: "8px", borderBottom: `3px solid ${accent}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "21px", fontWeight: "700", marginBottom: "2px", color: "#111" }}>{place.displayName?.text}</div>
            <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{category}</div>
            <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>{place.formattedAddress}</div>
          </div>
          <div style={{ background: isOpen ? "#EAF3DE" : "#FAEEDA", color: isOpen ? "#3B6D11" : "#854F0B", fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", flexShrink: 0, marginLeft: "8px" }}>
            {isOpen ? "Open now" : "Closed"}
          </div>
        </div>

       <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          {avgReviuRating ? (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", background: accentMedium, padding: "5px 12px", borderRadius: "20px", border: `1px solid ${accentBorder}` }}>
              <span style={{ color: "#534AB7", fontSize: "14px" }}>{"✦".repeat(Math.round(Number(avgReviuRating)))}</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: accent }}>{avgReviuRating}</span>
              <span style={{ fontSize: "11px", color: "#888" }}>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
            </div>
         ) : (
            <Link href={`/post-review?google_place_id=${id}&name=${encodeURIComponent(place.displayName?.text || "")}`} style={{ background: accentLight, color: accent, fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "20px", border: `1px solid ${accentBorder}`, textDecoration: "none" }}>
              No reviews yet — be the first ✦
            </Link>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          {place.internationalPhoneNumber && (
            <a href={`tel:${place.internationalPhoneNumber}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 6px", background: accentMedium, borderRadius: "12px", textDecoration: "none", border: `1px solid ${accentBorder}` }}>
              <span style={{ fontSize: "20px" }}>📞</span>
              <span style={{ fontSize: "11px", color: accent, fontWeight: "600" }}>Call</span>
            </a>
          )}
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 6px", background: accentMedium, borderRadius: "12px", textDecoration: "none", border: `1px solid ${accentBorder}` }}>
            <span style={{ fontSize: "20px" }}>🗺</span>
            <span style={{ fontSize: "11px", color: accent, fontWeight: "600" }}>Directions</span>
          </a>
          {place.websiteUri && (
            <a href={place.websiteUri} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 6px", background: accentMedium, borderRadius: "12px", textDecoration: "none", border: `1px solid ${accentBorder}` }}>
              <span style={{ fontSize: "20px" }}>🌐</span>
              <span style={{ fontSize: "11px", color: accent, fontWeight: "600" }}>Website</span>
            </a>
          )}
          <Link href={`/post-review?google_place_id=${id}&name=${encodeURIComponent(place.displayName?.text || "")}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 6px", background: accent, borderRadius: "12px", textDecoration: "none", border: `1px solid ${accent}` }}>
            <span style={{ fontSize: "20px" }}>✦</span>
            <span style={{ fontSize: "11px", color: "white", fontWeight: "600" }}>Review</span>
          </Link>
        </div>

        {place.formattedAddress && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#666", paddingTop: "12px", borderTop: `1px solid ${accentBorder}` }}>
            <span>📍</span><span>{place.formattedAddress}</span>
          </div>
        )}
      </div>

      {place.photos?.length > 1 && (
        <div style={{ background: "white", padding: "1rem 0 1rem 1.25rem", marginBottom: "8px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Photos</div>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingRight: "1.25rem", paddingBottom: "4px" }}>
            {place.photos.slice(0, 6).map((p: any, i: number) => (
              <img key={i} src={getPhotoUrl(p.name)} alt={`Photo ${i + 1}`} style={{ width: "140px", height: "100px", objectFit: "cover", borderRadius: "12px", flexShrink: 0 }} />
            ))}
          </div>
        </div>
      )}

      {place.currentOpeningHours?.weekdayDescriptions && (
        <div style={{ background: "white", padding: "1rem 1.25rem", marginBottom: "8px" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Hours</div>
          {place.currentOpeningHours.weekdayDescriptions.map((day: string, i: number) => (
            <div key={i} style={{ fontSize: "13px", color: "#444", paddingBottom: "6px", marginBottom: "6px", borderBottom: i < 6 ? "1px solid #f5f5f5" : "none" }}>{day}</div>
          ))}
        </div>
      )}

      <div style={{ background: "white", padding: "1rem 1.25rem", marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </div>
          <Link href={`/post-review?google_place_id=${id}&name=${encodeURIComponent(place.displayName?.text || "")}`} style={{ fontSize: "12px", color: accent, fontWeight: "600", textDecoration: "none" }}>+ Write one</Link>
        </div>

        {reviews.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "2rem 0", background: accentLight, borderRadius: "12px", border: `1px solid ${accentBorder}` }}>
            No reviews yet — be the first ✦
          </div>
        ) : (
          <ReviewsList reviews={reviews} accent={accent} accentBorder={accentBorder} accentLight={accentLight} businessId={id} />
        )}

        <Link href={`/post-review?google_place_id=${id}&name=${encodeURIComponent(place.displayName?.text || "")}`} style={{ display: "block", background: accent, color: "white", padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", textDecoration: "none", marginTop: "8px" }}>
          Write a review
        </Link>
      </div>

      <ReportButton placeId={id} placeName={place.displayName?.text || ""} />

    </main>
  )
}