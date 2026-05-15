"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import ReviButton from "./ReviButton"

const categoryPhotos: Record<string, string> = {
  "Fine Dining": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "Italian Restaurant": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
  "Mexican Restaurant": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
  "Asian Restaurant": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80",
  "Experience": "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800&q=80",
  "Fitness": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  "Retail": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  "Grocery": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
  "Services": "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80",
  "Health": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
  "default": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
}

const moodFilters = [
  { icon: "🌆", label: "Downtown tonight", categories: ["Fine Dining", "Italian Restaurant", "Mexican Restaurant", "Asian Restaurant"] },
  { icon: "🍷", label: "Date night", categories: ["Fine Dining", "Italian Restaurant"] },
  { icon: "☀️", label: "Sunday brunch", categories: ["Experience", "Mexican Restaurant"] },
  { icon: "⚡", label: "Quick lunch", categories: ["Asian Restaurant", "Mexican Restaurant"] },
  { icon: "🎉", label: "Celebration", categories: ["Fine Dining", "Experience"] },
  { icon: "🌿", label: "Healthy", categories: ["Health", "Fitness"] },
]

export default function Home() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [activity, setActivity] = useState<Record<string, number>>({})
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    Promise.all([
      supabase.from("businesses").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("business_id").eq("status", "published"),
    ]).then(([bizRes, reviewRes]) => {
      setBusinesses(bizRes.data || [])
      const map: Record<string, number> = {}
      reviewRes.data?.forEach((r: any) => {
        map[r.business_id] = (map[r.business_id] || 0) + 1
      })
      setActivity(map)
      setLoading(false)
    })
  }, [])

  const activeFilterObj = moodFilters.find(f => f.label === activeFilter)
  const filteredBusinesses = activeFilterObj
    ? businesses.filter(b => activeFilterObj.categories.includes(b.category))
    : businesses

  const featured = filteredBusinesses[0]
  const trending = businesses.filter(b => activity[b.id] > 0).slice(0, 4)
  const rest = filteredBusinesses.slice(1)
  const specials = businesses.filter(b => b.special_today)

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#888", fontSize: "14px" }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>

      <div style={{ background: "#534AB7", padding: "1rem 1.25rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "white", letterSpacing: "-0.5px" }}>Reviu</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginTop: "1px" }}>Cincinnati, OH</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/post-review" style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "20px", textDecoration: "none" }}>
            + Review
          </Link>
          <Link href="/profile" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            <span style={{ fontSize: "16px", color: "white" }}>◯</span>
          </Link>
        </div>
      </div>

      <div style={{ padding: "1rem 0 0", position: "relative" }}>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", paddingLeft: "1.25rem", paddingRight: "2.5rem", scrollbarWidth: "none" } as any}>
          <div onClick={() => setActiveFilter(null)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "20px", background: activeFilter === null ? "#534AB7" : "white", border: activeFilter === null ? "1px solid #534AB7" : "1px solid #e8e8e8", whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0 }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: activeFilter === null ? "white" : "#444" }}>All</span>
          </div>
          {moodFilters.map(mood => (
            <div key={mood.label} onClick={() => setActiveFilter(activeFilter === mood.label ? null : mood.label)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "20px", background: activeFilter === mood.label ? "#534AB7" : "white", border: activeFilter === mood.label ? "1px solid #534AB7" : "1px solid #e8e8e8", whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ fontSize: "14px" }}>{mood.icon}</span>
              <span style={{ fontSize: "12px", fontWeight: "500", color: activeFilter === mood.label ? "white" : "#444" }}>{mood.label}</span>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", right: 0, top: "1rem", bottom: 0, width: "48px", background: "linear-gradient(to right, rgba(247,247,245,0), rgba(247,247,245,1))", pointerEvents: "none" }} />
      </div>

      {specials.length > 0 && !activeFilter && (
        <div style={{ padding: "1.25rem 1.25rem 0" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Today's specials</div>
          {specials.map((biz: any) => (
            <Link key={biz.id} href={`/business/${biz.id}`} style={{ textDecoration: "none", display: "block", marginBottom: "10px" }}>
              <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid #eee", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
                  <img src={biz.cover_url || categoryPhotos[biz.category] || categoryPhotos.default} alt={biz.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: "#534AB7", background: "#EEEDFE", padding: "2px 8px", borderRadius: "10px" }}>SPECIAL</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#111" }}>{biz.name}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#555", lineHeight: "1.4" }}>{biz.special_today}</div>
                </div>
                <span style={{ color: "#ddd", fontSize: "18px" }}>›</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {featured && (
        <div style={{ padding: "1.25rem 1.25rem 0" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            {activeFilter ? activeFilter : "Featured this week"}
          </div>
          <Link href={`/business/${featured.id}`} style={{ textDecoration: "none", display: "block" }}>
            <div style={{ borderRadius: "20px", overflow: "hidden", position: "relative", height: "220px", background: "#ddd" }}>
              <img src={featured.cover_url || categoryPhotos[featured.category] || categoryPhotos.default} alt={featured.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)" }} />
              {featured.special_today && (
                <div style={{ position: "absolute", top: "12px", right: "12px", background: "#534AB7", color: "white", fontSize: "10px", fontWeight: "700", padding: "4px 10px", borderRadius: "10px" }}>
                  SPECIAL TODAY
                </div>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem" }}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "white", marginBottom: "4px" }}>{featured.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>{featured.category} · {featured.city}</span>
                  <span style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "10px" }}>
                    {featured.google_rating} ✦
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {trending.length > 0 && !activeFilter && (
        <div style={{ padding: "1.25rem 1.25rem 0" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Active on Reviu</div>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" } as any}>
            {trending.map((biz: any) => (
              <Link key={biz.id} href={`/business/${biz.id}`} style={{ textDecoration: "none", flexShrink: 0, width: "140px" }}>
                <div style={{ borderRadius: "14px", overflow: "hidden", height: "100px", background: "#ddd", marginBottom: "8px" }}>
                  <img src={biz.cover_url || categoryPhotos[biz.category] || categoryPhotos.default} alt={biz.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#111", marginBottom: "2px", lineHeight: "1.3" }}>{biz.name}</div>
                <div style={{ fontSize: "11px", color: "#888" }}>{activity[biz.id]} review{activity[biz.id] > 1 ? "s" : ""} this week</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: "1.25rem 1.25rem 0" }}>
        <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
          {activeFilter ? `${activeFilter} spots` : "All businesses"}
        </div>

        {filteredBusinesses.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", background: "white", borderRadius: "16px" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
            <div style={{ fontSize: "14px", color: "#888" }}>No businesses found for this vibe yet</div>
            <div onClick={() => setActiveFilter(null)} style={{ fontSize: "13px", color: "#534AB7", fontWeight: "600", marginTop: "12px", cursor: "pointer" }}>Show all businesses</div>
          </div>
        )}

        {rest.map((biz: any) => (
          <Link key={biz.id} href={`/business/${biz.id}`} style={{ textDecoration: "none", display: "block", marginBottom: "10px" }}>
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid #eee", display: "flex", height: "88px" }}>
              <div style={{ width: "88px", flexShrink: 0, background: "#ddd" }}>
                <img src={biz.cover_url || categoryPhotos[biz.category] || categoryPhotos.default} alt={biz.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginBottom: "3px" }}>{biz.name}</div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>{biz.category} · {biz.city}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#534AB7" }}>{"✦".repeat(Math.round(biz.google_rating || 0))}</span>
                  <span style={{ fontSize: "11px", color: "#888" }}>{biz.google_rating}</span>
                  {biz.special_today && <span style={{ fontSize: "10px", color: "#534AB7", background: "#EEEDFE", padding: "1px 6px", borderRadius: "6px", fontWeight: "600" }}>Special today</span>}
                  {!biz.claimed && !biz.special_today && <span style={{ fontSize: "10px", color: "#854F0B", background: "#FAEEDA", padding: "1px 6px", borderRadius: "6px", fontWeight: "600" }}>Unclaimed</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", padding: "0 12px" }}>
                <span style={{ color: "#ddd", fontSize: "18px" }}>›</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <ReviButton />

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <div onClick={() => { setActiveFilter(null); window.scrollTo(0, 0) }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer" }}>
          <span style={{ fontSize: "20px" }}>⊞</span>
          <span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>Home</span>
        </div>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
          <span style={{ fontSize: "20px" }}>⊕</span>
          <span style={{ fontSize: "11px", color: "#888" }}>Review</span>
        </Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
          <span style={{ fontSize: "20px" }}>✦</span>
          <span style={{ fontSize: "11px", color: "#888" }}>Influencers</span>
        </Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
          <span style={{ fontSize: "20px" }}>◯</span>
          <span style={{ fontSize: "11px", color: "#888" }}>Profile</span>
        </Link>
      </div>
    </div>
  )
}