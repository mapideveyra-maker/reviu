"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export default function BusinessDashboard() {
  const [user, setUser] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [reels, setReels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [specialText, setSpecialText] = useState("")
  const [specialMediaUrl, setSpecialMediaUrl] = useState("")
  const [specialMediaType, setSpecialMediaType] = useState("")
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [savingSpecial, setSavingSpecial] = useState(false)
  const [specialSaved, setSpecialSaved] = useState(false)
  const [responseText, setResponseText] = useState<Record<string, string>>({})
  const [savingResponse, setSavingResponse] = useState<string | null>(null)
  const [reelTitle, setReelTitle] = useState("")
  const [reelDesc, setReelDesc] = useState("")
  const [reelUrl, setReelUrl] = useState("")
  const [reelType, setReelType] = useState("daily")
  const [savingReel, setSavingReel] = useState(false)
  const [reelSaved, setReelSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return }
      if (data.user.user_metadata?.account_type !== "business") { router.push("/"); return }
      setUser(data.user)

      const { data: bizData } = await supabase
        .from("businesses")
        .select("*")
        .eq("claimed", true)
        .eq("owner_id", data.user.id)
        .single()

      if (bizData) {
        setBusiness(bizData)
        setSpecialText(bizData.special_today || "")
        setSpecialMediaUrl(bizData.special_media_url || "")
        setSpecialMediaType(bizData.special_media_type || "")

        const [reviewRes, reelRes] = await Promise.all([
          supabase.from("reviews").select("*").eq("business_id", bizData.id).order("created_at", { ascending: false }),
          supabase.from("reels").select("*").eq("business_id", bizData.id).order("created_at", { ascending: false }),
        ])
        setReviews(reviewRes.data || [])
        setReels(reelRes.data || [])
      }
      setLoading(false)
    })
  }, [])

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !business) return
    setUploadingMedia(true)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const ext = file.name.split(".").pop()
    const fileName = `specials/${business.id}-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from("reviu-media")
      .upload(fileName, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from("reviu-media").getPublicUrl(fileName)
      setSpecialMediaUrl(urlData.publicUrl)
      setSpecialMediaType(file.type.startsWith("video") ? "video" : "image")
    }
    setUploadingMedia(false)
  }

  async function saveSpecial() {
    if (!business) return
    setSavingSpecial(true)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.from("businesses").update({
      special_today: specialText || null,
      special_media_url: specialMediaUrl || null,
      special_media_type: specialMediaType || null,
      special_expires_at: specialText ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
    }).eq("id", business.id)
    setSavingSpecial(false)
    setSpecialSaved(true)
    setTimeout(() => setSpecialSaved(false), 3000)
  }

  async function saveResponse(reviewId: string) {
    setSavingResponse(reviewId)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.from("reviews").update({
      business_response: responseText[reviewId],
      business_response_at: new Date().toISOString(),
    }).eq("id", reviewId)
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, business_response: responseText[reviewId] } : r))
    setSavingResponse(null)
  }

  async function postReel() {
    if (!reelTitle || !reelUrl) return
    setSavingReel(true)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const expires = reelType === "daily" ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
    const { data } = await supabase.from("reels").insert({
      business_id: business.id,
      user_id: user.id,
      title: reelTitle,
      description: reelDesc,
      video_url: reelUrl,
      reel_type: reelType,
      expires_at: expires,
      is_featured: reelType === "featured",
    }).select().single()
    if (data) {
      setReels(prev => [data, ...prev])
      setReelTitle("")
      setReelDesc("")
      setReelUrl("")
      setReelSaved(true)
      setTimeout(() => setReelSaved(false), 3000)
    }
    setSavingReel(false)
  }

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#888" }}>Loading dashboard...</div>
    </div>
  )

  if (!business) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <span style={{ fontSize: "16px", fontWeight: "600", color: "white" }}>Business Dashboard</span>
      </div>
      <div style={{ padding: "3rem 1.25rem", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏪</div>
        <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>No claimed business yet</div>
        <div style={{ fontSize: "14px", color: "#888", marginBottom: "24px", lineHeight: "1.6" }}>
          Find your business on Reviu and claim it to access your dashboard.
        </div>
        <Link href="/" style={{ display: "block", background: "#534AB7", color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", textDecoration: "none" }}>
          Find my business
        </Link>
      </div>
    </div>
  )

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
    : "—"
  const pendingReviews = reviews.filter(r => r.status === "pending")
  const publishedReviews = reviews.filter(r => r.status === "published")

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "white" }}>{business.name}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Business Dashboard</div>
          </div>
        </div>
        <div style={{ background: "#EAF3DE", color: "#3B6D11", fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px" }}>
          ✓ Verified
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #e8e8e8", background: "white", overflowX: "auto" }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "reviews", label: `Reviews ${reviews.length > 0 ? `(${reviews.length})` : ""}` },
          { id: "special", label: "Special" },
          { id: "reels", label: "Reels" },
        ].map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 16px",
              fontSize: "13px",
              fontWeight: activeTab === tab.id ? "600" : "400",
              color: activeTab === tab.id ? "#534AB7" : "#888",
              borderBottom: activeTab === tab.id ? "2px solid #534AB7" : "2px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >{tab.label}</div>
        ))}
      </div>

      <div style={{ padding: "1rem" }}>

        {activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
              {[
                { label: "Total reviews", value: reviews.length.toString(), color: "#534AB7" },
                { label: "Avg Reviu rating", value: `${avgRating} ★`, color: "#f59e0b" },
                { label: "Pending responses", value: pendingReviews.length.toString(), color: pendingReviews.length > 0 ? "#A32D2D" : "#3B6D11" },
                { label: "Published reviews", value: publishedReviews.length.toString(), color: "#3B6D11" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "white", borderRadius: "12px", padding: "14px", border: "1px solid #eee" }}>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>{stat.label}</div>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {pendingReviews.length > 0 && (
              <div style={{ background: "#FAEEDA", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#854F0B", marginBottom: "4px" }}>
                  ⏱ {pendingReviews.length} review{pendingReviews.length > 1 ? "s" : ""} in resolution window
                </div>
                <div style={{ fontSize: "12px", color: "#854F0B", lineHeight: "1.5" }}>
                  You have 72 hours to respond privately before it goes public.
                </div>
                <div onClick={() => setActiveTab("reviews")} style={{ fontSize: "12px", color: "#534AB7", fontWeight: "600", marginTop: "8px", cursor: "pointer" }}>
                  View and respond →
                </div>
              </div>
            )}

            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee", marginBottom: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Quick actions</div>
              {[
                { label: "Post today's special", sub: "Let people know what's happening today", tab: "special", icon: "✨" },
                { label: "Post a reel", sub: "Share a video to attract new customers", tab: "reels", icon: "🎬" },
                { label: "Respond to reviews", sub: `${pendingReviews.length} pending in 72hr window`, tab: "reviews", icon: "💬" },
              ].map(action => (
                <div key={action.label} onClick={() => setActiveTab(action.tab)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{action.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#534AB7" }}>{action.label}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>{action.sub}</div>
                  </div>
                  <span style={{ color: "#ddd", fontSize: "18px" }}>›</span>
                </div>
              ))}
            </div>

            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>External ratings</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { label: "Google", value: `${business.google_rating} ★` },
                  { label: "Yelp", value: business.yelp_rating ? `${business.yelp_rating} ★` : "N/A" },
                ].map(stat => (
                  <div key={stat.label} style={{ flex: 1, background: "#f7f7f5", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>{stat.label}</div>
                    <div style={{ fontSize: "16px", fontWeight: "700" }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "reviews" && (
          <>
            {reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", background: "white", borderRadius: "16px" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>💬</div>
                <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>No reviews yet</div>
                <div style={{ fontSize: "13px", color: "#888" }}>Reviews will appear here once customers start leaving them.</div>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: review.status === "pending" ? "1px solid #EF9F27" : "1px solid #eee" }}>
                  {review.status === "pending" && (
                    <div style={{ background: "#FAEEDA", borderRadius: "8px", padding: "8px 12px", marginBottom: "12px", fontSize: "12px", color: "#854F0B", fontWeight: "500" }}>
                      ⏱ In 72hr resolution window — respond before it goes public
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#534AB7" }}>
                        {review.reviewer_initials || "R"}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600" }}>{review.reviewer_name || "Reviu Member"}</div>
                        <div style={{ fontSize: "11px", color: "#888" }}>
                          {review.context_tag && `${review.context_tag} · `}
                          {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex" }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize: "13px", color: s <= review.stars ? "#f59e0b" : "#ddd" }}>★</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.6", marginBottom: "12px" }}>{review.text}</div>

                  {review.business_response ? (
                    <div style={{ background: "#EEEDFE", borderRadius: "10px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "600", color: "#534AB7", marginBottom: "4px" }}>Your response</div>
                      <div style={{ fontSize: "13px", color: "#3C3489", lineHeight: "1.5" }}>{review.business_response}</div>
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={responseText[review.id] || ""}
                        onChange={e => setResponseText(prev => ({ ...prev, [review.id]: e.target.value }))}
                        placeholder="Respond to this review..."
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e5e5", fontSize: "13px", background: "#f7f7f5", minHeight: "80px", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif", lineHeight: "1.5", marginBottom: "8px" }}
                      />
                      <div
                        onClick={() => saveResponse(review.id)}
                        style={{ background: savingResponse === review.id ? "#9990D9" : "#534AB7", color: "white", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}
                      >
                        {savingResponse === review.id ? "Sending..." : "Send response"}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "special" && (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee" }}>
            <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>Today's special</div>
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "16px", lineHeight: "1.5" }}>
              Post something happening today — a dish, a deal, an event. Add a photo or video to make it stand out. Expires in 24 hours automatically.
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "8px" }}>Photo or video</label>

              {specialMediaUrl ? (
                <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", marginBottom: "8px" }}>
                  {specialMediaType === "video" ? (
                    <video src={specialMediaUrl} controls style={{ width: "100%", borderRadius: "12px" }} />
                  ) : (
                    <img src={specialMediaUrl} alt="Special" style={{ width: "100%", borderRadius: "12px", objectFit: "cover", maxHeight: "200px" }} />
                  )}
                  <div
                    onClick={() => { setSpecialMediaUrl(""); setSpecialMediaType("") }}
                    style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", color: "white", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "14px" }}
                  >✕</div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: "2px dashed #e5e5e5", borderRadius: "12px", padding: "2rem", textAlign: "center", cursor: "pointer", background: "#f7f7f5", marginBottom: "8px" }}
                >
                  {uploadingMedia ? (
                    <div style={{ color: "#888", fontSize: "14px" }}>Uploading...</div>
                  ) : (
                    <>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>📸</div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#534AB7", marginBottom: "4px" }}>Add a photo or video</div>
                      <div style={{ fontSize: "12px", color: "#aaa" }}>Tap to upload from your device</div>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                style={{ display: "none" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Description</label>
              <textarea
                value={specialText}
                onChange={e => setSpecialText(e.target.value)}
                placeholder="e.g. Half price oysters at the bar 5–7pm. Live jazz starts at 8."
                style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", minHeight: "100px", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif", lineHeight: "1.6" }}
              />
            </div>

            {specialSaved && (
              <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "500", marginBottom: "12px" }}>
                ✓ Special posted — now live on your profile and homepage
              </div>
            )}

            <div
              onClick={saveSpecial}
              style={{ background: savingSpecial ? "#9990D9" : "#534AB7", color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: "pointer", marginBottom: "10px" }}
            >
              {savingSpecial ? "Posting..." : "Post special"}
            </div>

            {(specialText || specialMediaUrl) && (
              <div
                onClick={() => { setSpecialText(""); setSpecialMediaUrl(""); setSpecialMediaType(""); saveSpecial() }}
                style={{ background: "white", color: "#A32D2D", padding: "12px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: "pointer", border: "1px solid #F09595" }}
              >
                Remove today's special
              </div>
            )}
          </div>
        )}

        {activeTab === "reels" && (
          <>
            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee", marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>Post a reel</div>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "16px", lineHeight: "1.5" }}>
                Share a video to show off your food, atmosphere, or a special moment. Daily reels expire in 24 hours. Featured reels stay on your profile permanently.
              </div>

              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {[
                  { value: "daily", label: "🌅 Daily", sub: "Expires in 24hrs" },
                  { value: "featured", label: "⭐ Featured", sub: "Stays forever" },
                ].map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => setReelType(opt.value)}
                    style={{ flex: 1, padding: "12px", borderRadius: "12px", border: reelType === opt.value ? "2px solid #534AB7" : "1px solid #eee", background: reelType === opt.value ? "#EEEDFE" : "#f7f7f5", cursor: "pointer", textAlign: "center" }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: "600", color: reelType === opt.value ? "#534AB7" : "#333" }}>{opt.label}</div>
                    <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{opt.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Title</label>
                <input
                  type="text"
                  value={reelTitle}
                  onChange={e => setReelTitle(e.target.value)}
                  placeholder="e.g. Friday night truffle pasta"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Description (optional)</label>
                <textarea
                  value={reelDesc}
                  onChange={e => setReelDesc(e.target.value)}
                  placeholder="Tell people what they are watching..."
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", minHeight: "80px", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif", lineHeight: "1.5" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Video URL</label>
                <input
                  type="text"
                  value={reelUrl}
                  onChange={e => setReelUrl(e.target.value)}
                  placeholder="https://... (YouTube, Vimeo, TikTok link)"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }}
                />
                <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>Direct video upload coming soon. For now paste a link.</div>
              </div>

              {reelSaved && (
                <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "500", marginBottom: "12px" }}>
                  ✓ Reel posted successfully
                </div>
              )}

              <div
                onClick={postReel}
                style={{ background: !reelTitle || !reelUrl || savingReel ? "#9990D9" : "#534AB7", color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: !reelTitle || !reelUrl ? "not-allowed" : "pointer" }}
              >
                {savingReel ? "Posting..." : "Post reel"}
              </div>
            </div>

            {reels.length > 0 && (
              <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Your reels</div>
                {reels.map(reel => (
                  <div key={reel.id} style={{ paddingBottom: "12px", marginBottom: "12px", borderBottom: "1px solid #f5f5f5" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600" }}>{reel.title}</div>
                      <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", background: reel.reel_type === "featured" ? "#EAF3DE" : "#EEEDFE", color: reel.reel_type === "featured" ? "#3B6D11" : "#534AB7" }}>
                        {reel.reel_type === "featured" ? "⭐ Featured" : "🌅 Daily"}
                      </span>
                    </div>
                    {reel.description && <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{reel.description}</div>}
                    <div style={{ fontSize: "11px", color: "#aaa" }}>
                      {new Date(reel.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {reel.expires_at && ` · Expires ${new Date(reel.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊞</span><span style={{ fontSize: "11px", color: "#888" }}>Home</span></Link>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊕</span><span style={{ fontSize: "11px", color: "#888" }}>Review</span></Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>✦</span><span style={{ fontSize: "11px", color: "#888" }}>Influencers</span></Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>◯</span><span style={{ fontSize: "11px", color: "#888" }}>Profile</span></Link>
      </div>
    </div>
  )
}