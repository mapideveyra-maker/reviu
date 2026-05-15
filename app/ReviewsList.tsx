"use client"
import Link from "next/link"
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
  if (reviews.length === 0) return (
    <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "2rem 0", background: accentLight, borderRadius: "12px", border: `1px solid ${accentBorder}` }}>
      No reviews yet — be the first ✦
    </div>
  )

  return (
    <>
      {reviews.map((review: any) => (
        <div key={review.id} style={{ paddingBottom: "16px", marginBottom: "16px", borderBottom: `1px solid ${accentBorder}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `rgba(83,74,183,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: accent, flexShrink: 0, border: `1px solid ${accentBorder}` }}>
                {review.reviewer_initials || "R"}
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
        </div>
      ))}
    </>
  )
}