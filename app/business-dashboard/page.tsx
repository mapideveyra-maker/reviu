import Link from "next/link"
export default function BusinessDashboard() {
  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>Business Dashboard</span>
        <Link href="/business" style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>View profile</Link>
      </div>
      <div style={{ padding: "1rem" }}>
        <div style={{ background: "#EAF3DE", borderRadius: "12px", padding: "12px 16px", marginBottom: "1rem", fontSize: "13px", color: "#3B6D11", lineHeight: "1.5" }}>
          ✓ <strong>{"Maria's Bakery & Cafe"}</strong> is verified and claimed. You now have full access to your dashboard.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "1rem" }}>
          {[
            { label: "Total reviews", value: "182", color: "#534AB7" },
            { label: "Legitimacy score", value: "94%", color: "#3B6D11" },
            { label: "Suspicious flagged", value: "2", color: "#A32D2D" },
            { label: "Avg rating", value: "4.6 ★", color: "#854F0B" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "white", borderRadius: "12px", padding: "14px", border: "1px solid #eee" }}>
              <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>{stat.label}</div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Pending reviews</div>
          <div style={{ background: "#FAEEDA", borderRadius: "10px", padding: "12px", marginBottom: "10px", border: "1px solid #EF9F27" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>TechCritic99</span>
              <span style={{ fontSize: "11px", background: "#FAEEDA", color: "#854F0B", padding: "2px 8px", borderRadius: "6px", fontWeight: "600" }}>72hr window open</span>
            </div>
            <div style={{ fontSize: "12px", color: "#f59e0b", marginBottom: "4px" }}>★☆☆☆☆</div>
            <div style={{ fontSize: "13px", color: "#555", marginBottom: "10px" }}>Health code violations everywhere. Do not eat here.</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1, background: "#534AB7", color: "white", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>Respond privately</div>
              <Link href="/reviewer" style={{ flex: 1, background: "white", color: "#534AB7", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", textAlign: "center", cursor: "pointer", border: "1px solid #534AB7", textDecoration: "none" }}>View reviewer</Link>
            </div>
          </div>
        </div>
        <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Quick actions</div>
          {[
            { label: "Connect with an influencer", sub: "Find creators to promote your business", href: "/influencers" },
            { label: "Dispute a suspicious review", sub: "Flag bad-faith reviews for removal", href: "/reviewer" },
            { label: "Update business info", sub: "Hours, photos, menu, contact details", href: "/business" },
            { label: "View all reviews", sub: "See every review with legitimacy scores", href: "/business" },
          ].map(action => (
            <Link key={action.label} href={action.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f5f5f5", textDecoration: "none" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#534AB7" }}>{action.label}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{action.sub}</div>
              </div>
              <span style={{ color: "#ccc", fontSize: "16px" }}>›</span>
            </Link>
          ))}
        </div>
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
