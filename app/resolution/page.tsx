"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export default function Resolution() {
  const [user, setUser] = useState<any>(null)
  const [pendingReviews, setPendingReviews] = useState<any[]>([])
  const [resolvedReviews, setResolvedReviews] = useState<any[]>([])
  const [unresolved, setUnresolvedReviews] = useState<any[]>([])
  const [messages, setMessages] = useState<Record<string, any[]>>({})
  const [messageText, setMessageText] = useState<Record<string, string>>({})
  const [sendingMessage, setSendingMessage] = useState<string | null>(null)
  const [updatingRating, setUpdatingRating] = useState<string | null>(null)
  const [newRating, setNewRating] = useState<Record<string, number>>({})
  const [newText, setNewText] = useState<Record<string, string>>({})
  const [notResolved, setNotResolved] = useState<Record<string, boolean>>({})
  const [showResolveForm, setShowResolveForm] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return }
      setUser(data.user)

      const { data: reviews } = await supabase
        .from("reviews")
        .select("*, businesses(name, brand_color)")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })

      const pending = reviews?.filter(r => r.status === "pending") || []
      const resolved = reviews?.filter(r => r.status === "published" && r.resolution_status === "resolved") || []
      const unres = reviews?.filter(r => r.status === "published" && r.resolution_status === "unresolved") || []

      setPendingReviews(pending)
      setResolvedReviews(resolved)
      setUnresolvedReviews(unres)

      const initialText: Record<string, string> = {}
      pending.forEach((r: any) => { initialText[r.id] = r.text })
      setNewText(initialText)

      if (pending.length > 0) {
        const msgPromises = pending.map((r: any) =>
          supabase.from("messages").select("*").eq("review_id", r.id).order("created_at", { ascending: true })
        )
        const msgResults = await Promise.all(msgPromises)
        const msgMap: Record<string, any[]> = {}
        pending.forEach((r: any, i: number) => { msgMap[r.id] = msgResults[i].data || [] })
        setMessages(msgMap)
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
      sender_type: "customer",
      message: messageText[reviewId].trim(),
    }).select().single()
    if (data) {
      setMessages(prev => ({ ...prev, [reviewId]: [...(prev[reviewId] || []), data] }))
      setMessageText(prev => ({ ...prev, [reviewId]: "" }))
      setNotResolved(prev => ({ ...prev, [reviewId]: false }))
    }
    setSendingMessage(null)
  }

  async function confirmResolved(reviewId: string, stars: number, text: string) {
    setUpdatingRating(reviewId)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await supabase.from("reviews").update({
      stars,
      text: text.trim(),
      status: "published",
      resolution_status: "resolved",
      resolved_at: new Date().toISOString(),
      customer_voted: true,
    }).eq("id", reviewId)
    const resolved = pendingReviews.find(r => r.id === reviewId)
    if (resolved) {
      setResolvedReviews(prev => [{ ...resolved, stars, text: text.trim(), status: "published", resolution_status: "resolved" }, ...prev])
      setPendingReviews(prev => prev.filter(r => r.id !== reviewId))
    }
    setUpdatingRating(null)
  }

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#888" }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/profile" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>My Reviews</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Resolution center</div>
        </div>
      </div>

      <div style={{ padding: "1rem" }}>

        {pendingReviews.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#854F0B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>⏱ Pending</div>
            {pendingReviews.map(review => {
              const accentColor = review.businesses?.brand_color || "#534AB7"
              const reviewMessages = messages[review.id] || []
              const hasBusinessMessage = reviewMessages.some((m: any) => m.sender_type === "business")
              const businessMarkedResolved = review.business_voted
              const hoursLeft = review.pending_expires_at ? Math.max(0, Math.round((new Date(review.pending_expires_at).getTime() - Date.now()) / 3600000)) : 72

              return (
                <div key={review.id} style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #EF9F27" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>{review.businesses?.name}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>⏱ {hoursLeft}hrs left</div>
                  </div>

                  <div style={{ background: "#f7f7f5", borderRadius: "10px", padding: "10px 12px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "2px", marginBottom: "6px" }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize: "14px", color: s <= review.stars ? "#534AB7" : "#ddd" }}>✦</span>
                      ))}
                    </div>
                    <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.6" }}>{review.text}</div>
                  </div>

                  {!hasBusinessMessage && !businessMarkedResolved && (
                    <div style={{ background: "#FAEEDA", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", color: "#854F0B", lineHeight: "1.5" }}>
                      ⏱ Waiting for the business to reach out. If they don't respond in {hoursLeft} hours your review posts automatically.
                    </div>
                  )}

                  {(hasBusinessMessage || businessMarkedResolved) && !showResolveForm[review.id] && !notResolved[review.id] && (
                    <>
                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", marginBottom: "8px" }}>Private conversation</div>
                        {reviewMessages.map((msg: any) => (
                          <div key={msg.id} style={{ marginBottom: "8px", display: "flex", justifyContent: msg.sender_type === "customer" ? "flex-end" : "flex-start" }}>
                            <div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: msg.sender_type === "customer" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.sender_type === "customer" ? "#534AB7" : accentColor, color: "white", fontSize: "13px", lineHeight: "1.5" }}>
                              {msg.message}
                            </div>
                          </div>
                        ))}
                      </div>

                      {!businessMarkedResolved && (
                        <>
                          <textarea
                            value={messageText[review.id] || ""}
                            onChange={e => setMessageText(prev => ({ ...prev, [review.id]: e.target.value }))}
                            placeholder="Reply to the business..."
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e5e5", fontSize: "13px", background: "#f7f7f5", minHeight: "70px", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif", lineHeight: "1.5", marginBottom: "8px" }}
                          />
                          <div onClick={() => sendMessage(review.id)} style={{ background: sendingMessage === review.id ? "#9990D9" : "#534AB7", color: "white", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>
                            {sendingMessage === review.id ? "Sending..." : "Send reply"}
                          </div>
                        </>
                      )}

                      {businessMarkedResolved && (
                        <>
                          <div style={{ background: "#EAF3DE", borderRadius: "10px", padding: "10px 12px", marginBottom: "12px", fontSize: "13px", color: "#3B6D11", fontWeight: "500" }}>
                            ✓ The business says this has been resolved. Do you agree?
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <div onClick={() => setNotResolved(prev => ({ ...prev, [review.id]: true }))} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #EF9F27", background: "white", color: "#854F0B", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>
                              Not resolved
                            </div>
                            <div onClick={() => setShowResolveForm(prev => ({ ...prev, [review.id]: true }))} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #3B6D11", background: "#EAF3DE", color: "#3B6D11", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>
                              Resolved ✓
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {showResolveForm[review.id] && (
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Update your rating</div>
                      <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>Your updated review posts instantly with a Resolved badge.</div>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                        {[4, 5].map(star => (
                          <div key={star} onClick={() => setNewRating(prev => ({ ...prev, [review.id]: star }))} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: newRating[review.id] === star ? "2px solid #534AB7" : "1px solid #eee", background: newRating[review.id] === star ? "#EEEDFE" : "#f7f7f5", cursor: "pointer", textAlign: "center" }}>
                            <div style={{ fontSize: "18px", marginBottom: "4px" }}>
                              {Array.from({ length: star }, (_, i) => <span key={i} style={{ color: "#534AB7" }}>✦</span>)}
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: "600", color: newRating[review.id] === star ? "#534AB7" : "#888" }}>
                              {star === 4 ? "Very good" : "Excellent"}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: "#888", marginBottom: "6px" }}>Update your review (optional)</div>
                        <textarea
                          value={newText[review.id] || review.text}
                          onChange={e => setNewText(prev => ({ ...prev, [review.id]: e.target.value }))}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e5e5", fontSize: "13px", background: "#f7f7f5", minHeight: "80px", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif", lineHeight: "1.5" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <div onClick={() => setShowResolveForm(prev => ({ ...prev, [review.id]: false }))} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #eee", background: "white", color: "#888", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>
                          Cancel
                        </div>
                        <div onClick={() => newRating[review.id] && confirmResolved(review.id, newRating[review.id], newText[review.id] || review.text)} style={{ flex: 2, background: !newRating[review.id] || updatingRating === review.id ? "#9990D9" : "#534AB7", color: "white", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: newRating[review.id] ? "pointer" : "not-allowed" }}>
                          {updatingRating === review.id ? "Posting..." : newRating[review.id] ? `Post as ${newRating[review.id]} ✦ — Resolved` : "Pick a rating first"}
                        </div>
                      </div>
                    </div>
                  )}

                  {notResolved[review.id] && (
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#854F0B" }}>Tell the business what still needs to be fixed</div>
                      <textarea
                        value={messageText[review.id] || ""}
                        onChange={e => setMessageText(prev => ({ ...prev, [review.id]: e.target.value }))}
                        placeholder="Explain what wasn't resolved..."
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e5e5", fontSize: "13px", background: "#f7f7f5", minHeight: "80px", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif", lineHeight: "1.5", marginBottom: "8px" }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <div onClick={() => setNotResolved(prev => ({ ...prev, [review.id]: false }))} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #eee", background: "white", color: "#888", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>
                          Cancel
                        </div>
                        <div onClick={() => sendMessage(review.id)} style={{ flex: 1, background: sendingMessage === review.id ? "#9990D9" : "#534AB7", color: "white", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>
                          {sendingMessage === review.id ? "Sending..." : "Send message"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {resolvedReviews.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#3B6D11", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>✓ Resolved</div>
            {resolvedReviews.map(review => (
              <div key={review.id} style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>{review.businesses?.name}</div>
                  <div style={{ background: "#EAF3DE", color: "#3B6D11", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" }}>✓ Resolved</div>
                </div>
                <div style={{ display: "flex", gap: "2px", marginBottom: "8px" }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ fontSize: "14px", color: s <= review.stars ? "#534AB7" : "#ddd" }}>✦</span>
                  ))}
                </div>
                <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.6" }}>{review.text}</div>
              </div>
            ))}
          </div>
        )}

        {unresolved.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#854F0B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>⚠ Unresolved</div>
            {unresolved.map(review => (
              <div key={review.id} style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>{review.businesses?.name}</div>
                  <div style={{ background: "#FAEEDA", color: "#854F0B", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" }}>⚠ Unresolved</div>
                </div>
                <div style={{ display: "flex", gap: "2px", marginBottom: "8px" }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ fontSize: "14px", color: s <= review.stars ? "#534AB7" : "#ddd" }}>✦</span>
                  ))}
                </div>
                <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.6" }}>{review.text}</div>
              </div>
            ))}
          </div>
        )}

        {pendingReviews.length === 0 && resolvedReviews.length === 0 && unresolved.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 1rem", background: "white", borderRadius: "16px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✦</div>
            <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>No reviews in resolution</div>
            <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.6" }}>When a business reaches out about your review it will appear here privately.</div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊞</span><span style={{ fontSize: "11px", color: "#888" }}>Home</span></Link>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊕</span><span style={{ fontSize: "11px", color: "#888" }}>Review</span></Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>✦</span><span style={{ fontSize: "11px", color: "#888" }}>Influencers</span></Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>◯</span><span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>Profile</span></Link>
      </div>
    </div>
  )
}