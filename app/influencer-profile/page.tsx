"use client"
import Link from "next/link"
import { useState } from "react"
export default function InfluencerProfile() {
  const [requested, setRequested] = useState(false)
  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/influencers" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <span style={{ fontSize: "16px", fontWeight: "600", color: "white" }}>Creator Profile</span>
      </div>
      <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "#534AB7", flexShrink: 0 }}>SR</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "2px" }}>SarahEats</div>
            <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>Food and Dining · Cincinnati, OH</div>
            <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", background: "#FAEEDA", color: "#854F0B" }}>Rising Creator</span>
          </div>
          <div style={{ background: "#EAF3DE", color: "#3B6D11", fontSize: "13px", fontWeight: "700", padding: "6px 10px", borderRadius: "10px", textAlign: "center" }}>
            <div>92</div>
            <div style={{ fontSize: "10px" }}>/100</div>
          </div>
        </div>
        <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.6", marginBottom: "16px" }}>
          Cincinnati food lover sharing honest reviews of local restaurants, hidden gems, and everything delicious in the 513. Partnering with businesses that share my love for great food.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          {[
            { label: "Followers", value: "48.2K" },
            { label: "Engagement", value: "6.8%" },
            { label: "Collabs done", value: "24" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "#f7f7f5", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>{stat.label}</div>
              <div style={{ fontSize: "16px", fontWeight: "700" }}>{stat.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: 1, background: "#f7f7f5", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>Instagram</div>
            <div style={{ fontSize: "13px", fontWeight: "600" }}>@saraheats513</div>
          </div>
          <div style={{ flex: 1, background: "#f7f7f5", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>TikTok</div>
            <div style={{ fontSize: "13px", fontWeight: "600" }}>@saraheats</div>
          </div>
        </div>
      </div>
      <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Collaboration rates</div>
        {[
          { type: "Instagram post", price: "$150 - $300" },
          { type: "Instagram reel", price: "$200 - $400" },
          { type: "TikTok video", price: "$175 - $350" },
          { type: "Story mention", price: "$75 - $150" },
          { type: "Barter / free meal", price: "Open to discuss" },
        ].map(rate => (
          <div key={rate.type} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f5f5", fontSize: "13px" }}>
            <span style={{ color: "#333" }}>{rate.type}</span>
            <span style={{ fontWeight: "600", color: "#534AB7" }}>{rate.price}</span>
          </div>
        ))}
      </div>
      <div style={{ background: "white", padding: "1.25rem", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Recent collaborations</div>
        {[
          { biz: "Rosario Italian Kitchen", type: "Instagram reel", result: "12K views · 847 likes" },
          { biz: "Blue Lotus Yoga", type: "Story mention", result: "3.2K views · 94 clicks" },
          { biz: "Grind House Coffee", type: "TikTok video", result: "28K views · 1.2K likes" },
        ].map(collab => (
          <div key={collab.biz} style={{ paddingBottom: "12px", marginBottom: "12px", borderBottom: "1px solid #f5f5f5" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>{collab.biz}</div>
            <div style={{ fontSize: "12px", color: "#888", marginBottom: "2px" }}>{collab.type}</div>
            <div style={{ fontSize: "12px", color: "#3B6D11", fontWeight: "500" }}>{collab.result}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 1rem 1rem" }}>
        {requested ? (
          <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "16px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center" }}>
            ✓ Connection request sent! SarahEats will respond within 48 hours.
          </div>
        ) : (
          <div onClick={() => setRequested(true)} style={{ background: "#534AB7", color: "white", padding: "16px", borderRadius: "14px", fontSize: "15px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>
            Send collaboration request
          </div>
        )}
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
