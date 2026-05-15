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
  const [followers, setFollowers] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [specialText, setSpecialText] = useState("")
  const [specialMediaUrl, setSpecialMediaUrl] = useState("")
  const [specialMediaType, setSpecialMediaType] = useState("")
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [savingSpecial, setSavingSpecial] = useState(false)
  const [specialSaved, setSpecialSaved] = useState(false)
  const [messages, setMessages] = useState<Record<string, any[]>>({})
  const [messageText, setMessageText] = useState<Record<string, string>>({})
  const [sendingMessage, setSendingMessage] = useState<string | null>(null)
  const [reelTitle, setReelTitle] = useState("")
  const [reelDesc, setReelDesc] = useState("")
  const [reelUrl, setReelUrl] = useState("")
  const [reelType, setReelType] = useState("daily")
  const [savingReel, setSavingReel] = useState(false)
  const [reelSaved, setReelSaved] = useState(false)
  const [brandColor, setBrandColor] = useState("#534AB7")
  const [tagline, setTagline] = useState("")
  const [musicUrl, setMusicUrl] = useState("")
  const [musicTitle, setMusicTitle] = useState("")
  const [savingBrand, setSavingBrand] = useState(false)
  const [brandSaved, setBrandSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
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
        setBrandColor(bizData.brand_color || "#534AB7")
        setTagline(bizData.tagline || "")
        setMusicUrl(bizData.music_url || "")
        setMusicTitle(bizData.music_title || "")

        const [reviewRes, reelRes, followRes] = await Promise.all([
          supabase.from("reviews").select("*").eq("business_id", bizData.id).order("created_at", { ascending: false }),
          supabase.from("reels").select("*").eq("business_id", bizData.id).order("created_at", { ascending: false }),
          supabase.from("follows").select("id", { count: "exact" }).eq("business_id", bizData.id),
        ])
        setReviews(reviewRes.data || [])
        setReels(reelRes.data || [])
        setFollowers(followRes.count || 0)

        const pendingReviews = reviewRes.data?.filter(r => r.status === "pending") || []
        if (pendingReviews.length > 0) {
          const msgPromises = pendingReviews.map(r =>
            supabase.from("messages").select("*").eq("review_id", r.id).order("created_at", { ascending: true })
          )
          const msgResults = await Promise.all(msgPromises)
          const msgMap: Record<string, any[]> = {}
          pendingReviews.forEach((r, i) => {
            msgMap[r.id] = msgResults[i].data || []
          })
          setMessages(msgMap)
        }
      }
      setLoading(false)
    })
  }, [])

  async function sendMessage(reviewId: string) {
    if (!messageText[reviewId]?.trim()) return
    setSendingMessage(reviewId)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data } = await supabase.from("messages").insert({
      review_id: reviewId,
      sender_id: user.id,
      sender_type: "business",
      message: messageText[reviewId].trim(),
    }).select().single()
    if (data) {
      setMessages(prev => ({ ...prev, [reviewId]: [...(prev[reviewId] || []), data] }))
      setMessageText(prev => ({ ...prev, [reviewId]: "" }))
    }
    setSendingMessage(null)
  }

  async function markResolved(reviewId: string) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await supabase.from("reviews").update({
      business_voted: true,
    }).eq("id", reviewId)
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, business_voted: true } : r))
  }

  async function uploadFile(file: File, folder: string) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const ext = file.name.split(".").pop()
    const fileName = `${folder}/${business.id}-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from("reviu-media").upload(fileName, file, { upsert: true })
    if (error) return null
    const { data: urlData } = supabase.storage.from("reviu-media").getPublicUrl(fileName)
    return urlData.publicUrl
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const url = await uploadFile(file, "logos")
    if (url) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      await supabase.from("businesses").update({ logo_url: url }).eq("id", business.id)
      setBusiness((prev: any) => ({ ...prev, logo_url: url }))
    }
    setUploadingLogo(false)
  }

  async function removeLogo() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await supabase.from("businesses").update({ logo_url: null }).eq("id", business.id)
    setBusiness((prev: any) => ({ ...prev, logo_url: null }))
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingGallery(true)
    const urls = await Promise.all(files.map(f => uploadFile(f, "gallery")))
    const validUrls = urls.filter(Boolean) as string[]
    if (validUrls.length) {
      const newGallery = [...(business.gallery_urls || []), ...validUrls].slice(0, 8)
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      await supabase.from("businesses").update({ gallery_urls: newGallery }).eq("id", business.id)
      setBusiness((prev: any) => ({ ...prev, gallery_urls: newGallery }))
    }
    setUploadingGallery(false)
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingMedia(true)
    const url = await uploadFile(file, "specials")
    if (url) {
      setSpecialMediaUrl(url)
      setSpecialMediaType(file.type.startsWith("video") ? "video" : "image")
    }
    setUploadingMedia(false)
  }

  async function saveBrand() {
    if (!business) return
    setSavingBrand(true)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await supabase.from("businesses").update({
      brand_color: brandColor,
      tagline,
      music_url: musicUrl || null,
      music_title: musicTitle || null,
    }).eq("id", business.id)
    setBusiness((prev: any) => ({ ...prev, brand_color: brandColor, tagline, music_url: musicUrl, music_title: musicTitle }))
    setSavingBrand(false)
    setBrandSaved(true)
    setTimeout(() => setBrandSaved(false), 3000)
  }

  async function removeGalleryPhoto(url: string) {
    const newGallery = (business.gallery_urls || []).filter((u: string) => u !== url)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await supabase.from("businesses").update({ gallery_urls: newGallery }).eq("id", business.id)
    setBusiness((prev: any) => ({ ...prev, gallery_urls: newGallery }))
  }

  async function saveSpecial() {
    if (!business) return
    setSavingSpecial(true)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
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

  async function postReel() {
    if (!reelTitle || !reelUrl) return
    setSavingReel(true)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
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
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🪪</div>
        <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>No claimed business yet</div>
        <div style={{ fontSize: "14px", color: "#888", marginBottom: "24px", lineHeight: "1.6" }}>Find your business on Reviu and claim it to access your dashboard.</div>
        <Link href="/" style={{ display: "block", background: "#534AB7", color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", textDecoration: "none" }}>Find my business</Link>
      </div>
    </div>
  )

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1) : "—"
  const pendingReviews = reviews.filter(r => r.status === "pending")
  const publishedReviews = reviews.filter(r => r.status === "published")
  const accentColor = business.brand_color || "#534AB7"

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: accentColor, padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "white" }}>{business.name}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Business Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href={`/business/${business.id}`} style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: "11px", fontWeight: "600", padding: "5px 12px", borderRadius: "20px", textDecoration: "none" }}>
            View profile →
          </Link>
          <div style={{ background: "#EAF3DE", color: "#3B6D11", fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px" }}>✓</div>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #e8e8e8", background: "white", overflowX: "auto" }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "reviews", label: `Reviews ${reviews.length > 0 ? `(${reviews.length})` : ""}` },
          { id: "special", label: "Special" },
          { id: "reels", label: "Reels" },
          { id: "brand", label: "Brand" },
          { id: "rewards", label: "Rewards" },
        ].map(tab => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "12px 16px", fontSize: "13px", fontWeight: activeTab === tab.id ? "600" : "400", color: activeTab === tab.id ? accentColor : "#888", borderBottom: activeTab === tab.id ? `2px solid ${accentColor}` : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{tab.label}</div>
        ))}
      </div>

      <div style={{ padding: "1rem" }}>

        {activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
              {[
                { label: "Total reviews", value: reviews.length.toString(), color: accentColor },
                { label: "Avg ✦ rating", value: `${avgRating} ✦`, color: "#534AB7" },
                { label: "Reviu followers", value: followers.toString(), color: accentColor },
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
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#854F0B", marginBottom: "4px" }}>⏱ {pendingReviews.length} review{pendingReviews.length > 1 ? "s" : ""} in 72hr resolution window</div>
                <div style={{ fontSize: "12px", color: "#854F0B", lineHeight: "1.5" }}>Reach out privately before they go public.</div>
                <div onClick={() => setActiveTab("reviews")} style={{ fontSize: "12px", color: accentColor, fontWeight: "600", marginTop: "8px", cursor: "pointer" }}>View and respond →</div>
              </div>
            )}

            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Quick actions</div>
              {[
                { label: "Brand your profile", sub: "Logo, colors, gallery, music", tab: "brand", icon: "🎨" },
                { label: "Post today's special", sub: "Notify your followers instantly", tab: "special", icon: "✨" },
                { label: "Post a reel", sub: "Share a video to attract customers", tab: "reels", icon: "🎬" },
                { label: "Reviu Rewards", sub: `${followers} followers on your list`, tab: "rewards", icon: "♟" },
                { label: "Resolve reviews", sub: `${pendingReviews.length} pending in 72hr window`, tab: "reviews", icon: "💬" },
              ].map(action => (
                <div key={action.label} onClick={() => setActiveTab(action.tab)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{action.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: accentColor }}>{action.label}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>{action.sub}</div>
                  </div>
                  <span style={{ color: "#ddd", fontSize: "18px" }}>›</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "reviews" && (
          <>
            {pendingReviews.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#854F0B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>⏱ In resolution window</div>
                {pendingReviews.map(review => {
                  const reviewMessages = messages[review.id] || []
                  const hoursLeft = Math.max(0, Math.round((new Date(review.pending_expires_at).getTime() - Date.now()) / 3600000))
                  return (
                    <div key={review.id} style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #EF9F27" }}>
                      <div style={{ background: "#FAEEDA", borderRadius: "8px", padding: "8px 12px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "12px", color: "#854F0B", fontWeight: "500" }}>
                          ⏱ {hoursLeft}hrs left to resolve
                        </div>
                        <div style={{ fontSize: "11px", color: "#854F0B" }}>Private</div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: accentColor }}>
                          {review.reviewer_initials || "R"}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600" }}>{review.reviewer_name || "Reviu Member"}</div>
                          <div style={{ fontSize: "11px", color: "#888" }}>{review.context_tag} · {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                        </div>
                        <div style={{ marginLeft: "auto", display: "flex" }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ fontSize: "13px", color: s <= review.stars ? "#534AB7" : "#ddd" }}>✦</span>
                          ))}
                        </div>
                      </div>

                      <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.6", marginBottom: "12px", padding: "10px 12px", background: "#f7f7f5", borderRadius: "10px" }}>{review.text}</div>

                      {reviewMessages.length > 0 && (
                        <div style={{ marginBottom: "12px" }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", marginBottom: "8px" }}>Private conversation</div>
                          {reviewMessages.map((msg: any) => (
                            <div key={msg.id} style={{ marginBottom: "8px", display: "flex", justifyContent: msg.sender_type === "business" ? "flex-end" : "flex-start" }}>
                              <div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: msg.sender_type === "business" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.sender_type === "business" ? accentColor : "#f0f0f0", color: msg.sender_type === "business" ? "white" : "#333", fontSize: "13px", lineHeight: "1.5" }}>
                                {msg.message}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <textarea
                        value={messageText[review.id] || ""}
                        onChange={e => setMessageText(prev => ({ ...prev, [review.id]: e.target.value }))}
                        placeholder="Send a private message to resolve this..."
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e5e5", fontSize: "13px", background: "#f7f7f5", minHeight: "80px", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif", lineHeight: "1.5", marginBottom: "8px" }}
                      />

                      <div style={{ display: "flex", gap: "8px" }}>
                        <div onClick={() => sendMessage(review.id)} style={{ flex: 1, background: sendingMessage === review.id ? "#9990D9" : accentColor, color: "white", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>
                          {sendingMessage === review.id ? "Sending..." : "Send message"}
                        </div>
                        {!review.business_voted && (
                          <div onClick={() => markResolved(review.id)} style={{ flex: 1, background: "white", color: "#3B6D11", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: "pointer", border: "1px solid #3B6D11" }}>
                            Mark resolved ✓
                          </div>
                        )}
                        {review.business_voted && (
                          <div style={{ flex: 1, background: "#EAF3DE", color: "#3B6D11", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", border: "1px solid #3B6D11" }}>
                            Waiting for customer ✓
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {publishedReviews.length > 0 && (
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Published reviews</div>
                {publishedReviews.map(review => (
                  <div key={review.id} style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
                    {review.resolution_status === "resolved" && (
                      <div style={{ background: "#EAF3DE", borderRadius: "8px", padding: "6px 12px", marginBottom: "10px", fontSize: "12px", color: "#3B6D11", fontWeight: "500" }}>✓ Resolved</div>
                    )}
                    {review.resolution_status === "unresolved" && (
                      <div style={{ background: "#FAEEDA", borderRadius: "8px", padding: "6px 12px", marginBottom: "10px", fontSize: "12px", color: "#854F0B", fontWeight: "500" }}>⚠ Unresolved</div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: accentColor }}>
                          {review.reviewer_initials || "R"}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600" }}>{review.reviewer_name || "Reviu Member"}</div>
                          <div style={{ fontSize: "11px", color: "#888" }}>{review.context_tag} · {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex" }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ fontSize: "13px", color: s <= review.stars ? "#534AB7" : "#ddd" }}>✦</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.6" }}>{review.text}</div>
                  </div>
                ))}
              </div>
            )}

            {reviews.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 1rem", background: "white", borderRadius: "16px" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>💬</div>
                <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>No reviews yet</div>
                <div style={{ fontSize: "13px", color: "#888" }}>Reviews will appear here once customers start leaving them.</div>
              </div>
            )}
          </>
        )}

        {activeTab === "special" && (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee" }}>
            <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>Today's special</div>
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "8px", lineHeight: "1.5" }}>Post something happening today. Your Reviu followers get notified instantly. Expires in 24 hours.</div>
            {followers > 0 && (
              <div style={{ background: "#EEEDFE", borderRadius: "10px", padding: "8px 12px", marginBottom: "16px", fontSize: "12px", color: "#3C3489" }}>
                ♟ {followers} follower{followers > 1 ? "s" : ""} will be notified when you post
              </div>
            )}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "8px" }}>Photo or video</label>
              {specialMediaUrl ? (
                <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", marginBottom: "8px" }}>
                  {specialMediaType === "video" ? <video src={specialMediaUrl} controls style={{ width: "100%", borderRadius: "12px" }} /> : <img src={specialMediaUrl} alt="Special" style={{ width: "100%", borderRadius: "12px", objectFit: "cover", maxHeight: "200px" }} />}
                  <div onClick={() => { setSpecialMediaUrl(""); setSpecialMediaType("") }} style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", color: "white", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "14px" }}>✕</div>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} style={{ border: "2px dashed #e5e5e5", borderRadius: "12px", padding: "2rem", textAlign: "center", cursor: "pointer", background: "#f7f7f5", marginBottom: "8px" }}>
                  {uploadingMedia ? <div style={{ color: "#888", fontSize: "14px" }}>Uploading...</div> : (
                    <><div style={{ fontSize: "32px", marginBottom: "8px" }}>📸</div><div style={{ fontSize: "13px", fontWeight: "600", color: accentColor, marginBottom: "4px" }}>Add a photo or video</div><div style={{ fontSize: "12px", color: "#aaa" }}>Tap to upload from your device</div></>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaUpload} style={{ display: "none" }} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Description</label>
              <textarea value={specialText} onChange={e => setSpecialText(e.target.value)} placeholder="e.g. Half price oysters at the bar 5-7pm. Live jazz starts at 8." style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", minHeight: "100px", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif", lineHeight: "1.6" }} />
            </div>
            {specialSaved && <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "500", marginBottom: "12px" }}>✓ Special posted</div>}
            <div onClick={saveSpecial} style={{ background: savingSpecial ? "#9990D9" : accentColor, color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: "pointer", marginBottom: "10px" }}>
              {savingSpecial ? "Posting..." : "Post special"}
            </div>
            {(specialText || specialMediaUrl) && (
              <div onClick={() => { setSpecialText(""); setSpecialMediaUrl(""); setSpecialMediaType(""); saveSpecial() }} style={{ background: "white", color: "#A32D2D", padding: "12px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: "pointer", border: "1px solid #F09595" }}>
                Remove today's special
              </div>
            )}
          </div>
        )}

        {activeTab === "reels" && (
          <>
            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee", marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>Post a reel</div>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "16px", lineHeight: "1.5" }}>Share a video to show off your food, atmosphere, or a special moment.</div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {[{ value: "daily", label: "🌅 Daily", sub: "Expires in 24hrs" }, { value: "featured", label: "♟ Featured", sub: "Stays forever" }].map(opt => (
                  <div key={opt.value} onClick={() => setReelType(opt.value)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: reelType === opt.value ? `2px solid ${accentColor}` : "1px solid #eee", background: reelType === opt.value ? "#EEEDFE" : "#f7f7f5", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: reelType === opt.value ? accentColor : "#333" }}>{opt.label}</div>
                    <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{opt.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Title</label>
                <input type="text" value={reelTitle} onChange={e => setReelTitle(e.target.value)} placeholder="e.g. Friday night truffle pasta" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Description (optional)</label>
                <textarea value={reelDesc} onChange={e => setReelDesc(e.target.value)} placeholder="Tell people what they are watching..." style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", minHeight: "80px", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif", lineHeight: "1.5" }} />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Video URL</label>
                <input type="text" value={reelUrl} onChange={e => setReelUrl(e.target.value)} placeholder="https://... (YouTube, Vimeo, TikTok link)" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }} />
                <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>Direct video upload coming soon.</div>
              </div>
              {reelSaved && <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "500", marginBottom: "12px" }}>✓ Reel posted successfully</div>}
              <div onClick={postReel} style={{ background: !reelTitle || !reelUrl || savingReel ? "#9990D9" : accentColor, color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: !reelTitle || !reelUrl ? "not-allowed" : "pointer" }}>
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
                      <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", background: reel.reel_type === "featured" ? "#EAF3DE" : "#EEEDFE", color: reel.reel_type === "featured" ? "#3B6D11" : accentColor }}>
                        {reel.reel_type === "featured" ? "♟ Featured" : "🌅 Daily"}
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

        {activeTab === "brand" && (
          <>
            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee", marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>Logo</div>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "16px", lineHeight: "1.5" }}>Upload your logo. It replaces the initials on your profile.</div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: accentColor, border: "4px solid #eee", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {business.logo_url ? <img src={business.logo_url} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "22px", fontWeight: "700", color: "white" }}>{business.name.slice(0, 2).toUpperCase()}</span>}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div onClick={() => logoInputRef.current?.click()} style={{ padding: "10px 12px", borderRadius: "10px", border: `2px dashed ${accentColor}`, textAlign: "center", cursor: "pointer", background: "#f7f7f5" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: accentColor }}>{uploadingLogo ? "Uploading..." : "Upload logo"}</div>
                  </div>
                  {business.logo_url && (
                    <div onClick={removeLogo} style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #F09595", textAlign: "center", cursor: "pointer", background: "white" }}>
                      <div style={{ fontSize: "12px", fontWeight: "600", color: "#A32D2D" }}>Remove — use initials</div>
                    </div>
                  )}
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
              </div>
            </div>
            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee", marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>Brand color</div>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "16px", lineHeight: "1.5" }}>Pick your exact brand color.</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{ width: "56px", height: "56px", borderRadius: "12px", border: "none", cursor: "pointer", padding: "4px", background: "none" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>Current color</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: brandColor }} />
                    <div style={{ fontSize: "13px", color: "#888", fontFamily: "monospace" }}>{brandColor}</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee", marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>Tagline</div>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>A short line that appears under your name.</div>
              <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Cincinnati's best kept secret since 2019" maxLength={80} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }} />
            </div>
            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee", marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>Photo gallery</div>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px", lineHeight: "1.5" }}>Up to 8 photos shown on your profile.</div>
              {(business.gallery_urls || []).length > 0 && (
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "12px", paddingBottom: "4px" }}>
                  {(business.gallery_urls || []).map((url: string, i: number) => (
                    <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                      <img src={url} alt={`Gallery ${i+1}`} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px" }} />
                      <div onClick={() => removeGalleryPhoto(url)} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "white", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "11px" }}>✕</div>
                    </div>
                  ))}
                </div>
              )}
              {(business.gallery_urls || []).length < 8 && (
                <div onClick={() => galleryInputRef.current?.click()} style={{ border: "2px dashed #e5e5e5", borderRadius: "12px", padding: "1.5rem", textAlign: "center", cursor: "pointer", background: "#f7f7f5" }}>
                  {uploadingGallery ? <div style={{ color: "#888" }}>Uploading...</div> : (
                    <><div style={{ fontSize: "24px", marginBottom: "6px" }}>📷</div><div style={{ fontSize: "13px", fontWeight: "600", color: accentColor }}>Add photos</div><div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{8 - (business.gallery_urls || []).length} spots remaining</div></>
                  )}
                </div>
              )}
              <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} style={{ display: "none" }} />
            </div>
            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee", marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>Profile music</div>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px", lineHeight: "1.5" }}>A song that plays softly when someone opens your profile.</div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Song title</label>
                <input type="text" value={musicTitle} onChange={e => setMusicTitle(e.target.value)} placeholder="e.g. Kind of Blue - Miles Davis" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", display: "block", marginBottom: "6px" }}>Audio URL</label>
                <input type="text" value={musicUrl} onChange={e => setMusicUrl(e.target.value)} placeholder="https://... (direct audio link)" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box" }} />
              </div>
            </div>
            {brandSaved && <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "500", marginBottom: "12px" }}>✓ Brand settings saved</div>}
            <div onClick={saveBrand} style={{ background: savingBrand ? "#9990D9" : accentColor, color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>
              {savingBrand ? "Saving..." : "Save brand settings"}
            </div>
          </>
        )}

        {activeTab === "rewards" && (
          <>
            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #eee", marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>Reviu Rewards</div>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "16px", lineHeight: "1.5" }}>Customers who follow your business on Reviu get notified when you post specials or reels.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
                <div style={{ background: "#f7f7f5", borderRadius: "12px", padding: "16px", textAlign: "center", border: `2px solid ${accentColor}` }}>
                  <div style={{ fontSize: "32px", fontWeight: "700", color: accentColor }}>{followers}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Total followers</div>
                </div>
                <div style={{ background: "#f7f7f5", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "32px", fontWeight: "700", color: "#3B6D11" }}>{publishedReviews.length}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Verified reviewers</div>
                </div>
              </div>
              <div style={{ background: accentColor, borderRadius: "12px", padding: "1.25rem", textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "white", marginBottom: "8px" }}>Share your Reviu profile</div>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "white", fontFamily: "monospace", marginBottom: "12px", wordBreak: "break-all" }}>
                  reviu-swart.vercel.app/business/{business.id}
                </div>
                <div style={{ background: "white", color: accentColor, padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}
                  onClick={() => navigator.clipboard?.writeText(`https://reviu-swart.vercel.app/business/${business.id}`)}>
                  Copy profile link
                </div>
              </div>
            </div>
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