import Link from "next/link"
export default function Influencers() {
  const influencers = [
    { initials: "SR", name: "SarahEats", niche: "Food and Dining", location: "Cincinnati, OH", followers: "48.2K", engagement: "6.8%", tier: "Rising Creator", tierColor: "#854F0B", tierBg: "#FAEEDA", score: 92 },
    { initials: "MJ", name: "MikeJohnsonLife", niche: "Lifestyle and Food", location: "Cincinnati, OH", followers: "124K", engagement: "4.2%", tier: "Verified Influencer", tierColor: "#3C3489", tierBg: "#EEEDFE", score: 88 },
    { initials: "TL", name: "TasteWithTina", niche: "Food and Beauty", location: "Dayton, OH", followers: "8.9K", engagement: "9.1%", tier: "Local Voice", tierColor: "#3B6D11", tierBg: "#EAF3DE", score: 96 },
    { initials: "RC", name: "RyanCreates", niche: "Products and Tech", location: "Columbus, OH", followers: "312K", engagement: "3.1%", tier: "Top Creator", tierColor: "#185FA5", tierBg: "#E6F1FB", score: 84 },
    { initials: "AW", name: "AlexaWanders", niche: "Food and Travel", location: "Cincinnati, OH", followers: "22.1K", engagement: "7.4%", tier: "Rising Creator", tierColor: "#854F0B", tierBg: "#FAEEDA", score: 90 },
  ]
  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>Influencers</span>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>Cincinnati area</span>
      </div>
      <div style={{ padding: "1rem" }}>
        <input type="text" placeholder="Search influencers by name or niche..." style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "white", marginBottom: "1rem", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "1.25rem", paddingBottom: "4px" }}>
          {["All", "Food", "Lifestyle", "Beauty", "Tech", "Travel"].map(cat => (
            <div key={cat} style={{ padding: "6px 14px", borderRadius: "20px", background: cat === "All" ? "#534AB7" : "white", color: cat === "All" ? "white" : "#666", fontSize: "13px", whiteSpace: "nowrap", border: "1px solid #e5e5e5", cursor: "pointer" }}>{cat}</div>
          ))}
        </div>
        <div style={{ background: "#EEEDFE", borderRadius: "12px", padding: "12px 16px", marginBottom: "1.25rem", fontSize: "13px", color: "#3C3489", lineHeight: "1.5" }}>
          ✦ Are you an influencer? <strong>Join Reviu free</strong> and connect directly with local businesses.
        </div>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Featured creators</div>
        {influencers.map(inf => (
          <div key={inf.name} style={{ background: "white", borderRadius: "16px", padding: "1rem 1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700", color: "#534AB7", flexShrink: 0 }}>{inf.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "15px", fontWeight: "600" }}>{inf.name}</span>
                  <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", background: inf.tierBg, color: inf.tierColor }}>{inf.tier}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>{inf.niche} · {inf.location}</div>
              </div>
              <div style={{ background: "#EAF3DE", color: "#3B6D11", fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "8px", textAlign: "center" }}>{inf.score}/100</div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {[{ label: "Followers", value: inf.followers }, { label: "Engagement", value: inf.engagement }].map(stat => (
                <div key={stat.label} style={{ flex: 1, background: "#f7f7f5", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>{stat.label}</div>
                  <div style={{ fontSize: "14px", fontWeight: "700" }}>{stat.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link href="/influencer-profile" style={{ flex: 1, background: "#534AB7", color: "white", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", textDecoration: "none" }}>Connect</Link>
              <Link href="/influencer-profile" style={{ flex: 1, background: "white", color: "#534AB7", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", textDecoration: "none", border: "1px solid #534AB7" }}>View Profile</Link>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊞</span><span style={{ fontSize: "11px", color: "#888" }}>Home</span></Link>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊕</span><span style={{ fontSize: "11px", color: "#888" }}>Review</span></Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>✦</span><span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>Influencers</span></Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>◯</span><span style={{ fontSize: "11px", color: "#888" }}>Profile</span></Link>
      </div>
    </main>
  )
}
