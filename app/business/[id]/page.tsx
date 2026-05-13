import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

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
    .order("created_at", { ascending: false })
  return data || []
}

export default async function BusinessProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [biz, user, reviews] = await Promise.all([getBusiness(id), getUser(), getReviews(id)])
  if (!biz) return <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>Business not found</div>

  const isBusinessOwner = user?.user_metadata?.account_type === "business" && user?.id === biz.owner_id
  const lat = biz.latitude || 39.1031
  const lng = biz.longitude || -84.5120
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(biz.name + " " + biz.address + " " + biz.city)}`

  const avgReviuRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.stars, 0) / reviews.length).toFixed(1)
    : null

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ position: "relative", height: "260px", background: "#e8e8e8" }}>
        <iframe
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
          width="100%"
          height="100%"
          style={{ border: "none", filter: "saturate(1.1)", display: "block" }}
          loading="lazy"
        />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none" }} />
        <Link href="/" style={{ position: "absolute", top: "16px", left: "16px", width: "36px", height: "36px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", zIndex: 20 }}>←</Link>
        <div style={{ position: "absolute", bottom: "-36px", left: "20px", width: "72px", height: "72px", borderRadius: "50%", background: "#534AB7", border: "4px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 20 }}>
          {biz.name.slice(0, 2).toUpperCase()}
        </div>
      </div>

      <div style={{ background: "white", padding: "56px 1.25rem 1.25rem", marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "2px" }}>{biz.name}</div>
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>{biz.category} · {biz.city}, {biz.state}</div>
          </div>
          <div style={{ background: biz.claimed ? "#EAF3DE" : "#FAEEDA", color: biz.claimed ? "#3B6D11" : "#854F0B", fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", flexShrink: 0, marginLeft: "8px" }}>
            {biz.claimed ? "✓ Verified" : "Unclaimed"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          {avgReviuRating ? (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "#f59e0b", fontSize: "15px" }}>{"★".repeat(Math.round(Number(avgReviuRating)))}</span>
              <span style={{ fontSize: "14px", fontWeight: "700" }}>{avgReviuRating}</span>
              <span style={{ fontSize: "12px", color: "#888" }}>Reviu ({reviews.length})</span>
            </div>
          ) : (
            <div style={{ background: "#EEEDFE", color: "#3C3489", fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>No Reviu reviews yet</div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          {[
            { icon: "📞", label: "Call", href: `tel:${biz.phone}` },
            { icon: "🗺", label: "Directions", href: directionsUrl },
            { icon: "🌐", label: "Website", href: biz.website ? `https://${biz.website}` : "#" },
            { icon: "📅", label: "Reserve", href: biz.booking_url || "#" },
          ].map(action => (
            <a key={action.label} href={action.href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 6px", background: "#f7f7f5", borderRadius: "12px", textDecoration: "none" }}>
              <span style={{ fontSize: "20px" }}>{action.icon}</span>
              <span style={{ fontSize: "11px", color: "#555", fontWeight: "500" }}>{action.label}</span>
            </a>
          ))}
        </div>

        {biz.address && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#666", paddingTop: "12px", borderTop: "1px solid #f0f0f0", marginBottom: "8px" }}>
            <span>📍</span><span>{biz.address}, {biz.city}, {biz.state}</span>
          </div>
        )}

        {biz.description && (
          <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.6", paddingTop: "10px", borderTop: "1px solid #f0f0f0" }}>
            {biz.description}
          </div>
        )}
      </div>

      {biz.special_today && (
        <div style={{ background: "white", padding: "1rem 1.25rem", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#534AB7", background: "#EEEDFE", padding: "3px 10px", borderRadius: "20px" }}>✨ SPECIAL TODAY</span>
          </div>
          {biz.special_media_url && (
            <div style={{ borderRadius: "12px", overflow: "hidden", marginBottom: "10px" }}>
              {biz.special_media_type === "video" ? (
                <video
                  src={biz.special_media_url}
                  controls
                  style={{ width: "100%", borderRadius: "12px", maxHeight: "240px" }}
                />
              ) : (
                <img
                  src={biz.special_media_url}
                  alt="Today's special"
                  style={{ width: "100%", borderRadius: "12px", objectFit: "cover", maxHeight: "240px" }}
                />
              )}
            </div>
          )}
          <div style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}>{biz.special_today}</div>
        </div>
      )}

      <div style={{ background: "white", padding: "1rem 1.25rem", marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Reviu reviews {reviews.length > 0 && `(${reviews.length})`}
          </div>
          <Link href={`/post-review?business=${id}`} style={{ fontSize: "12px", color: "#534AB7", fontWeight: "600", textDecoration: "none" }}>+ Write one</Link>
        </div>

        {reviews.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "2rem 0", background: "#f7f7f5", borderRadius: "12px" }}>
            No reviews yet — be the first ✨
          </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} style={{ paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#534AB7", flexShrink: 0 }}>
                    {review.reviewer_initials || "R"}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>
                      {review.reviewer_name || "Reviu Member"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#888" }}>
                      {review.context_tag && `${review.context_tag} · `}
                      {review.is_first_visit && "First visit · "}
                      {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1px", flexShrink: 0 }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ fontSize: "13px", color: s <= review.stars ? "#f59e0b" : "#ddd" }}>★</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.6" }}>{review.text}</div>
              {review.business_response && (
                <div style={{ background: "#EEEDFE", borderRadius: "10px", padding: "10px 12px", marginTop: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "#534AB7", marginBottom: "4px" }}>Response from {biz.name}</div>
                  <div style={{ fontSize: "13px", color: "#3C3489", lineHeight: "1.5" }}>{review.business_response}</div>
                </div>
              )}
            </div>
          ))
        )}

        <Link href={`/post-review?business=${id}`} style={{ display: "block", background: "#534AB7", color: "white", padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", textDecoration: "none", marginTop: "8px" }}>
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
            <div key={stat.label} style={{ flex: 1, background: "#f7f7f5", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>{stat.label}</div>
              <div style={{ fontSize: "15px", fontWeight: "700" }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {isBusinessOwner && !biz.claimed && (
        <div style={{ padding: "0 1rem" }}>
          <Link href="/claim-business" style={{ display: "block", background: "#534AB7", color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", textDecoration: "none", marginBottom: "8px" }}>
            Claim this business — it is free
          </Link>
        </div>
      )}

      {isBusinessOwner && biz.claimed && (
        <div style={{ padding: "0 1rem" }}>
          <Link href="/business-dashboard" style={{ display: "block", background: "#534AB7", color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", textDecoration: "none", marginBottom: "8px" }}>
            Manage this business
          </Link>
        </div>
      )}

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊞</span><span style={{ fontSize: "11px", color: "#888" }}>Home</span></Link>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊕</span><span style={{ fontSize: "11px", color: "#888" }}>Review</span></Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>✦</span><span style={{ fontSize: "11px", color: "#888" }}>Influencers</span></Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>◯</span><span style={{ fontSize: "11px", color: "#888" }}>Profile</span></Link>
      </div>
    </main>
  )
}