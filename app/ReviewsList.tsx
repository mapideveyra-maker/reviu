"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import MediaViewer from "./MediaViewer"

function getScoreColor(score: number) {
  if (score >= 80) return "#3B6D11"
  if (score >= 60) return "#534AB7"
  if (score >= 40) return "#854F0B"
  return "#888"
}

export default function ReviewsList({ reviews, accent, accentBorder, accentLight, businessId }: {
  reviews: any[]
  accent: string
  accentBorder: string
  accentLight: string
  businessId: string
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingReview, setEditingReview] = useState<any | null>(null)
  const [editText, setEditText] = useState("")
  const [editStars, setEditStars] = useState(0)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [localReviews, setLocalReviews] = useState(reviews)

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
  }, [])

  function canEditOrDelete(review: any) {
    if (review.user_id !== currentUserId) return false
    if (review.stars >= 4) return true
    if (review.resolution_status === "resolved") return true
    return false
  }

  function openEdit(review: any) {
    setEditingReview(review)
    setEditText(review.text)
    setEditStars(review.stars)
  }

  async function saveEdit() {
    if (!editingReview) return
    setSavingEdit(true)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await supabase.from("reviews").update({ text: editText, stars: editStars }).eq("id", editingReview.id)
    setLocalReviews(prev => prev.map(r => r.id === editingReview.id ? { ...r, text: editText, stars: editStars } : r))
    setEditingReview(null)
    setSavingEdit(false)
  }

  async function deleteReview(reviewId: string) {
    setDeletingId(reviewId)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await supabase.from("reviews").delete().eq("id", reviewId)
    setLocalReviews(prev => prev.filter(r => r.id !== reviewId))
    setDeletingId(null)
  }

  if (localReviews.length === 0) return (
    <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "2rem 0", background: accentLight, borderRadius: "12px", border: `1px solid ${accentBorder}` }}>
      No reviews yet — be the first ✦
    </div>
  )

  return (
    <>
      {editingReview && (
        <>
          <div onClick={() => setEditingReview(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }} />
          <div style={{ position: "fixed", bottom: "64px", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderRadius: "20px 20px 0 0", zIndex: 201, padding: "1.25rem" }}>
            <div style={{ width: "36px", height: "4px", background: "#ddd", borderRadius: "2px", margin: "0 auto 16px" }} />
            <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>Edit your review</div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
              {[1,2,3,4,5].map(star => (
                <span key={star} onClick={() => editStars >= 4 ? setEditStars(star) : null} style={{ fontSize: "32px", color: star <= editStars ? "#534AB7" : "#ddd", cursor: editStars >= 4 ? "pointer" : "default" }}>✦</span>
              ))}
            </div>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", minHeight: "120px", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif", lineHeight: "1.6", marginBottom: "12px" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <div onClick={() => setEditingReview(null)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #eee", background: "white", color: "#888", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>
                Cancel
              </div>
              <div onClick={saveEdit} style={{ flex: 2, padding: "12px", borderRadius: "12px", background: savingEdit ? "#9990D9" : "#534AB7", color: "white", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>
                {savingEdit ? "Saving..." : "Save changes"}
              </div>
            </div>
          </div>
        </>
      )}

      {localReviews.map((review: any) => (
        <div key={review.id} style={{ paddingBottom: "16px", marginBottom: "16px", borderBottom: `1px solid ${accentBorder}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `rgba(83,74,183,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: accent, flexShrink: 0, border: `1px solid ${accentBorder}`, overflow: "hidden" }}>
                {review.reviewer_photo ? (
                  <img src={review.reviewer_photo} alt={review.reviewer_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  review.reviewer_initials || "R"
                )}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Link href={`/reviewer?id=${review.user_id}`} style={{ fontSize: "14px", fontWeight: "600", color: "#111", textDecoration: "none" }}>{review.reviewer_name || "Reviu Member"}</Link>
                  {review.legitimacy_score && (
                    <div style={{ fontSize: "10px", fontWeight: "700", color: getScoreColor(review.legitimacy_score), background: review.legitimacy_score >= 80 ? "#EAF3DE" : review.legitimacy_score >= 60 ? "#EEEDFE" : "#FAEEDA", padding: "2px 6px", borderRadius: "8px" }}>
                      ✦ {review.legitimacy_score}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: "11px", color: "#888" }}>
                  {review.context_tag && `${review.context_tag} · `}
                  {review.is_first_visit && "First visit · "}
                  {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
              <div style={{ display: "flex", gap: "1px" }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ fontSize: "13px", color: s <= review.stars ? "#534AB7" : "#ddd" }}>✦</span>
                ))}
              </div>
              {review.resolution_status === "resolved" && (
                <div style={{ background: "#EAF3DE", color: "#3B6D11", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px" }}>✓ Resolved</div>
              )}
              {review.resolution_status === "unresolved" && (
                <div style={{ background: "#FAEEDA", color: "#854F0B", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px" }}>⚠ Unresolved</div>
              )}
            </div>
          </div>
          <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.6", marginBottom: review.media_urls?.length > 0 ? "10px" : "0" }}>{review.text}</div>
          {review.media_urls?.length > 0 && (
            <MediaViewer urls={review.media_urls} />
          )}
          {canEditOrDelete(review) && (
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <div onClick={() => openEdit(review)} style={{ padding: "5px 12px", borderRadius: "20px", border: "1px solid #534AB7", background: "white", color: "#534AB7", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                Edit
              </div>
              <div onClick={() => deleteReview(review.id)} style={{ padding: "5px 12px", borderRadius: "20px", border: "1px solid #F09595", background: "white", color: "#A32D2D", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                {deletingId === review.id ? "Deleting..." : "Delete"}
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  )
}