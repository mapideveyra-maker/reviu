import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import TrackView from "../../TrackView"
import ReviewsList from "../../ReviewsList"
import BackButton from "../../BackButton"
import DirectionsButton from "../../DirectionsButton"

async function getBusiness(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single()
  if (error) console.error(error)
  return data
}

async function getUser() {
  try {
    const { createServerClient } = await import("@supabase/ssr")
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )
    const { data } = await supabase.auth.getUser()
    return data.user
  } catch {
    return null
  }
}

async function getReviews(businessId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "published")
    .order("legitimacy_score", { ascending: false })
  return data || []
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 83, g: 74, b: 183 }
}

export default async function BusinessProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [biz, user, reviews] = await Promise.all([getBusiness(id), getUser(), getReviews(id)])
  if (!biz) return <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>Business not found</div>

  const isBusinessOwner = user?.user_metadata?.account_type === "business" && user?.id === biz.owner_id
  const lat = parseFloat(biz.latitude) || 39.1031
  const lng = parseFloat(biz.longitude) || -84.5120
  const accent = biz.brand_color || "#534AB7"
  const rgb = hexToRgb(accent)
  const accentLight = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`
  const accentMedium = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`
  const accentBorder = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`

  const avgReviuRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.stars, 0) / reviews.length).toFixed(1)
    : null

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: accentLight, paddingBottom: "80px" }}>

      <TrackView businessId={id} category={biz.category} />

      {biz.music_url && (
        <audio autoPlay loop style={{ display: "none" }}>
          <source src={biz.music_url} />
        </audio>
      )}

      <div style={{ position: "relative", marginBottom: "0" }}>
        <div style={{ height: "260px", position: "relative" }}>
          <iframe
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed&gestureHandling=none`}
            width="100%"
            height="100%"
            style={{ border: "none", filter: "saturate(1.1)", display: "block", pointerEvents: "none" }}
            loading="lazy"
          />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }} />
          <BackButton />
          {biz.music_url && (
            <div style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.4)", color: "white", fontSize: "11px", padding: "4px 10px", borderRadius: "20px", zIndex: 20 }}>
              🎵 {biz.music_title || "Now playing"}
            </div>
          )}
        </div>
        <div style={{ position: "absolute", bottom: "-44px", left: "20px", width: "88px", height: "88px", borderRadius: "50%", background: accent, border: "5px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: "700", color: "white", boxShadow: "0 6px 20px rgba(0,0,0,0.2)", zIndex: 30, overflow: "hidden" }}>
          {biz.logo_url ? (
            <img src={biz.logo_url} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            biz.name.slice(0, 2).toUpperCase()
          )}
        </div>
      </div>

      <div style={{ background: "white", padding: "56px 1.25rem 1.25rem", marginBottom: "8px", borderBottom: `3px solid ${accent}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "21px", fontWeight: "700", marginBottom: "2px", color: "#111" }}>{biz.name}</div>
            {biz.tagline && (
              <div style={{ fontSize: "13px", color: accent, fontWeight: "500", marginBottom: "4px", fontStyle: "italic" }}>{biz.tagline}</div>
            )}
            <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>{biz.category} · {biz.city}, {biz.state}</div>
          </div>
          <div style={{ background: biz.claimed ? "#EAF3DE" : "#FAEEDA", color: biz.claimed ? "#3B6D11" : "#854F0B", fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", flexShrink: 0, marginLeft: "8px" }}>
            {biz.claimed ? "✓ Verified" : "Unclaimed"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          {avgReviuRating ? (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", background: accentMedium, padding: "5px 12px", borderRadius: "20px", border: `1px solid ${accentBorder}` }}>
              <span style={{ color: "#534AB7", fontSize: "14px" }}>{"✦".repeat(Math.round(Number(avgReviuRating)))}</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: accent }}>{avgReviuRating}</span>
              <span style={{ fontSize: "11px", color: "#888" }}>({reviews.length})</span>
            </div>
          ) : (
            <div style={{ background: accentLight, color: accent, fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "20px", border: `1px solid ${accentBorder}` }}>No reviews yet</div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          <a href={`tel:${biz.phone}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 6px", background: accentMedium, borderRadius: "12px", textDecoration: "none", border: `1px solid ${accentBorder}` }}>
            <span style={{ fontSize: "20px" }}>📞</span>
            <span style={{ fontSize: "11px", color: accent, fontWeight: "600" }}>Call</span>
          </a>
          <div style={{ background: accentMedium, borderRadius: "12px", border: `1px solid ${accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DirectionsButton name={biz.name} address={biz.address || ""} city={biz.city || ""} state={biz.state || ""} lat={lat} lng={lng} />
          </div>
          <a href={biz.website ? `https://${biz.website}` : "#"} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 6px", background: accentMedium, borderRadius: "12px", textDecoration: "none", border: `1px solid ${accentBorder}` }}>
            <span style={{ fontSize: "20px" }}>🌐</span>
            <span style={{ fontSize: "11px", color: accent, fontWeight: "600" }}>Website</span>
          </a>
          <a href={biz.booking_url || "#"} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 6px", background: accentMedium, borderRadius: "12px", textDecoration: "none", border: `1px solid ${accentBorder}` }}>
            <span style={{ fontSize: "20px" }}>📅</span>
            <span style={{ fontSize: "11px", color: accent, fontWeight: "600" }}>Reserve</span>
          </a>
        </div>

        {biz.address && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#666", paddingTop: "12px", borderTop: `1px solid ${accentBorder}`, marginBottom: "6px" }}>
            <span>📍</span><span>{biz.address}, {biz.city}, {biz.state}</span>
          </div>
        )}

        {biz.description && (
          <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.6", paddingTop: "10px", borderTop: `1px solid ${accentBorder}`, marginTop: "6px" }}>
            {biz.description}
          </div>
        )}
      </div>

      {(biz.gallery_urls || []).length > 0 && (
        <div style={{ background: "white", padding: "1rem 0 1rem 1.25rem", marginBottom: "8px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", paddingRight: "1.25rem" }}>Photos</div>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingRight: "1.25rem", paddingBottom: "4px" }}>
            {(biz.gallery_urls || []).map((url: string, i: number) => (
              <img key={i} src={url} alt={`${biz.name} photo ${i + 1}`} style={{ width: "140px", height: "100px", objectFit: "cover", borderRadius: "12px", flexShrink: 0 }} />
            ))}
          </div>
        </div>
      )}

      {biz.special_today && (
        <div style={{ background: "white", padding: "1rem 1.25rem", marginBottom: "8px", borderLeft: `4px solid ${accent}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: accent, background: accentMedium, padding: "3px 10px", borderRadius: "20px", border: `1px solid ${accentBorder}` }}>✦ SPECIAL TODAY</span>
          </div>
          {biz.special_media_url && (
            <div style={{ borderRadius: "12px", overflow: "hidden", marginBottom: "10px" }}>
              {biz.special_media_type === "video" ? (
                <video src={biz.special_media_url} controls style={{ width: "100%", borderRadius: "12px", maxHeight: "240px" }} />
              ) : (
                <img src={biz.special_media_url} alt="Today's special" style={{ width: "100%", borderRadius: "12px", objectFit: "cover", maxHeight: "240px" }} />
              )}
            </div>
          )}
          <div style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}>{biz.special_today}</div>
        </div>
      )}

      <div style={{ background: "white", padding: "1rem 1.25rem", marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </div>
          <Link href={`/post-review?business=${id}`} style={{ fontSize: "12px", color: accent, fontWeight: "600", textDecoration: "none" }}>+ Write one</Link>
        </div>

        <ReviewsList reviews={reviews} accent={accent} accentBorder={accentBorder} accentLight={accentLight} businessId={id} />

        <Link href={`/post-review?business=${id}`} style={{ display: "block", background: accent, color: "white", padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", textDecoration: "none", marginTop: "8px" }}>
          Write a review
        </Link>
      </div>

      <div style={{ background: "white", padding: "1rem 1.25rem", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>External ratings</div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { label: "Google", value: `${biz.google_rating} ★` },
            { label: "Yelp", value: biz.yelp_rating ? `${biz.yelp_rating} ★` : "N/A" },
          ].map(stat => (
            <div key={stat.label} style={{ flex: 1, background: accentLight, borderRadius: "10px", padding: "10px", textAlign: "center", border: `1px solid ${accentBorder}` }}>
              <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>{stat.label}</div>
              <div style={{ fontSize: "15px", fontWeight: "700" }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {isBusinessOwner && biz.claimed && (
        <div style={{ padding: "0 1rem 1rem" }}>
          <Link href="/business-dashboard" style={{ display: "block", background: accent, color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", textDecoration: "none" }}>
            Manage this business
          </Link>
        </div>
      )}
    </main>
  )
}