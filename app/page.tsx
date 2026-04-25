import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("*")

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "22px", fontWeight: "700", color: "white" }}>Reviu</span>
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>Cincinnati, OH</span>
      </div>
      <div style={{ padding: "1rem" }}>
        {error && <div style={{ background: "#FCEBEB", padding: "12px", borderRadius: "8px", marginBottom: "12px", fontSize: "13px", color: "#A32D2D" }}>Error: {error.message}</div>}
        {!error && (!businesses || businesses.length === 0) && <div style={{ background: "#FAEEDA", padding: "12px", borderRadius: "8px", marginBottom: "12px", fontSize: "13px", color: "#854F0B" }}>No businesses found in database</div>}
        {businesses && businesses.length > 0 && <div style={{ background: "#EAF3DE", padding: "12px", borderRadius: "8px", marginBottom: "12px", fontSize: "13px", color: "#3B6D11" }}>Found {businesses.length} businesses!</div>}
        <input type="text" placeholder="Search businesses, reviewers..." style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "white", marginBottom: "1rem", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "1.25rem", paddingBottom: "4px" }}>
          {["All","Restaurants","Retail","Services","Health","Beauty"].map(cat => (
            <div key={cat} style={{ padding: "6px 14px", borderRadius: "20px", background: cat === "All" ? "#534AB7" : "white", color: cat === "All" ? "white" : "#666", fontSize: "13px", whiteSpace: "nowrap", border: "1px solid #e5e5e5", cursor: "pointer" }}>{cat}</div>
          ))}
        </div>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Featured businesses</div>
        {businesses && businesses.map((biz: any) => (
          <Link href={`/business/${biz.id}`} key={biz.id} style={{ background: "white", borderRadius: "16px", padding: "1rem 1.25rem", marginBottom: "12px", border: "1px solid #eee", display: "block", textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div>
                <div style={{ fontWeight: "600", fontSize: "15px", marginBottom: "2px" }}>{biz.name}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{biz.category} · {biz.city}, {biz.state}</div>
              </div>
              <div style={{ background: "#EAF3DE", color: "#3B6D11", fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "8px" }}>{biz.google_rating}★</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#555" }}>
              <span style={{ color: "#f59e0b" }}>{"★".repeat(Math.round(biz.google_rating || 0))}</span>
              <span>{biz.google_rating} · {biz.address}</span>
              {!biz.claimed && <span style={{ background: "#FAEEDA", color: "#854F0B", fontSize: "11px", padding: "2px 8px", borderRadius: "6px", fontWeight: "600" }}>Unclaimed</span>}
            </div>
          </Link>
        ))}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊞</span><span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>Home</span></Link>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊕</span><span style={{ fontSize: "11px", color: "#888" }}>Review</span></Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>✦</span><span style={{ fontSize: "11px", color: "#888" }}>Influencers</span></Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>◯</span><span style={{ fontSize: "11px", color: "#888" }}>Profile</span></Link>
      </div>
    </main>
  )
}