import Link from "next/link"
export default function BusinessProfile() {
  const reviews = [
    { name: "SarahR_foodie", score: 94, stars: 5, text: "Incredible croissants and the staff remembered my name. My favorite neighborhood spot.", flags: ["Verified local", "247 reviews", "4.1 avg rating"], flagType: "good", time: "1 week ago" },
    { name: "TechCritic99", score: 8, stars: 1, text: "Health code violations everywhere. Do not eat here.", flags: ["Serial 1-star", "38 reviews all negative", "No verified purchases"], flagType: "bad", time: "5 days ago" },
    { name: "JohnD_1992", score: 12, stars: 1, text: "Worst experience ever. Never coming back.", flags: ["First review ever", "Account 3 days old"], flagType: "bad", time: "2 days ago" },
  ]
  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <span style={{ fontSize: "16px", fontWeight: "600", color: "white" }}>Business Profile</span>
      </div>
      <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: "700", marginBottom: "4px" }}>{"Maria's Bakery & Cafe"}</div>
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>Bakery · Hyde Park, Cincinnati OH</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#f59e0b", fontSize: "16px" }}>★★★★★</span>
              <span style={{ fontSize: "14px", fontWeight: "600" }}>4.6</span>
              <span style={{ fontSize: "13px", color: "#888" }}>· 182 reviews</span>
            </div>
          </div>
          <div style={{ background: "#EAF3DE", color: "#3B6D11", fontSize: "13px", fontWeight: "700", padding: "6px 12px", borderRadius: "10px", textAlign: "center" }}>
            <div>94%</div>
            <div style={{ fontSize: "10px", fontWeight: "500" }}>legit</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <Link href="/post-review" style={{ flex: 1, background: "#534AB7", color: "white", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", textDecoration: "none" }}>Write a Review</Link>
          <Link href="/claim-business" style={{ flex: 1, background: "#f7f7f5", color: "#534AB7", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", textDecoration: "none", border: "1px solid #534AB7" }}>Claim Business</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#555" }}>
          <span>📍 123 Erie Ave, Hyde Park, Cincinnati OH</span>
          <span>🕐 Open until 6pm</span>
          <span>📞 (513) 555-0142</span>
          <span>🌐 mariasbakery.com</span>
        </div>
      </div>
      <div style={{ background: "white", padding: "1rem 1.25rem", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Review legitimacy breakdown</div>
        {[
          { label: "Verified legitimate", pct: 94, color: "#639922" },
          { label: "Suspicious", pct: 4, color: "#A32D2D" },
          { label: "Unverified", pct: 2, color: "#854F0B" },
        ].map(item => (
          <div key={item.label} style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span>{item.label}</span>
              <span style={{ fontWeight: "600", color: item.color }}>{item.pct}%</span>
            </div>
            <div style={{ height: "6px", background: "#f0f0f0", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${item.pct}%`, height: "100%", background: item.color, borderRadius: "3px" }} />
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          {[
            { label: "Google rating", value: "4.4 ★" },
            { label: "Yelp rating", value: "4.1 ★" },
            { label: "Reviu score", value: "94%", highlight: true },
          ].map(stat => (
            <div key={stat.label} style={{ flex: 1, background: "#f7f7f5", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>{stat.label}</div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: stat.highlight ? "#3B6D11" : "#111" }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "white", padding: "1rem 1.25rem", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Reviews</div>
        {reviews.map(review => (
          <div key={review.name} style={{ paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: review.flagType === "good" ? "#EAF3DE" : "#FCEBEB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: review.flagType === "good" ? "#3B6D11" : "#A32D2D", flexShrink: 0 }}>
                {review.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <Link href="/reviewer" style={{ fontSize: "14px", fontWeight: "600", color: "#534AB7", textDecoration: "none" }}>{review.name}</Link>
                  <span style={{ background: review.score > 50 ? "#EAF3DE" : "#FCEBEB", color: review.score > 50 ? "#3B6D11" : "#A32D2D", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "6px" }}>{review.score}/100</span>
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>{"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)} · {review.time}</div>
              </div>
            </div>
            <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.5", marginBottom: "8px" }}>{review.text}</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {review.flags.map(flag => (
                <span key={flag} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "6px", background: review.flagType === "good" ? "#EAF3DE" : "#FCEBEB", color: review.flagType === "good" ? "#3B6D11" : "#A32D2D", fontWeight: "500" }}>{flag}</span>
              ))}
            </div>
          </div>
        ))}
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
