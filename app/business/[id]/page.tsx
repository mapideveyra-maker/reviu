import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

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

export default async function BusinessProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const biz = await getBusiness(id)
  if (!biz) return <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>Business not found</div>
  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <span style={{ fontSize: "16px", fontWeight: "600", color: "white" }}>Business Profile</span>
      </div>
      <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
        <div style={{ fontSize: "22px", fontWeight: "700", marginBottom: "4px" }}>{biz.name}</div>
        <div style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>{biz.category} · {biz.city}, {biz.state}</div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <Link href="/post-review" style={{ flex: 1, background: "#534AB7", color: "white", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", textDecoration: "none" }}>Write a Review</Link>
          <Link href="/claim-business" style={{ flex: 1, background: "#f7f7f5", color: "#534AB7", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", textDecoration: "none", border: "1px solid #534AB7" }}>Claim Business</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#555" }}>
          {biz.address && <span>📍 {biz.address}, {biz.city}, {biz.state}</span>}
          {biz.phone && <span>📞 {biz.phone}</span>}
          {biz.website && <span>🌐 {biz.website}</span>}
          {biz.description && <div style={{ marginTop: "8px", fontSize: "13px", color: "#666", lineHeight: "1.6" }}>{biz.description}</div>}
        </div>
      </div>
      <div style={{ background: "white", padding: "1rem 1.25rem", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Ratings overview</div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { label: "Google rating", value: `${biz.google_rating} ★` },
            { label: "Yelp rating", value: `${biz.yelp_rating} ★` },
            { label: "Reviu score", value: "Pending" },
          ].map(stat => (
            <div key={stat.label} style={{ flex: 1, background: "#f7f7f5", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>{stat.label}</div>
              <div style={{ fontSize: "15px", fontWeight: "700" }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "white", padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Reviews</div>
        <div style={{ fontSize: "13px", color: "#888", textAlign: "center", padding: "2rem 0" }}>No Reviu reviews yet. Be the first to review this business.</div>
        <Link href="/post-review" style={{ display: "block", background: "#534AB7", color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", textDecoration: "none" }}>Write the first review</Link>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊞</span><span style={{ fontSize: "11px", color: "#888" }}>Home</span></Link>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊕</span><span style={{ fontSize: "11px", color: "#888" }}>Review</span></Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>✦</span><span style={{ fontSize: "11px", color: "#888" }}>Influencers</span></Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>◯</span><span style={{ fontSize: "11px", color: "#888" }}>Profile</span></Link>
      </div>
    </main>
  )
}