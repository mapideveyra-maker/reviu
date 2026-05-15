"use client"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { useRouter, useSearchParams } from "next/navigation"

const contextTags: Record<string, { icon: string; label: string }[]> = {
  "Fine Dining": [{ icon: "🍽️", label: "Just dining" }, { icon: "✨", label: "Date night" }, { icon: "🥂", label: "Celebration" }, { icon: "🎁", label: "Someone's guest" }],
  "Italian Restaurant": [{ icon: "🍽️", label: "Just dining" }, { icon: "✨", label: "Date night" }, { icon: "🥂", label: "Celebration" }, { icon: "🎁", label: "Someone's guest" }],
  "Mexican Restaurant": [{ icon: "🍽️", label: "Just dining" }, { icon: "✨", label: "Date night" }, { icon: "🥂", label: "Celebration" }, { icon: "🎁", label: "Someone's guest" }],
  "Asian Restaurant": [{ icon: "🍽️", label: "Just dining" }, { icon: "✨", label: "Date night" }, { icon: "🥂", label: "Celebration" }, { icon: "🎁", label: "Someone's guest" }],
  "Experience": [{ icon: "🍽️", label: "Just dining" }, { icon: "✨", label: "Date night" }, { icon: "🥂", label: "Celebration" }, { icon: "🎁", label: "Someone's guest" }],
  "Restaurant": [{ icon: "🍽️", label: "Just dining" }, { icon: "✨", label: "Date night" }, { icon: "🥂", label: "Celebration" }, { icon: "🎁", label: "Someone's guest" }],
  "Fitness": [{ icon: "💪", label: "First class" }, { icon: "🔄", label: "Regular member" }, { icon: "🎁", label: "Guest of a member" }, { icon: "🏆", label: "Working toward a goal" }],
  "Retail": [{ icon: "🛒", label: "Weekly shop" }, { icon: "🎁", label: "Buying for someone" }, { icon: "🌟", label: "Treating myself" }, { icon: "🔍", label: "Just browsing" }],
  "Grocery": [{ icon: "🛒", label: "Weekly shop" }, { icon: "🎁", label: "Buying for someone" }, { icon: "🌟", label: "Treating myself" }, { icon: "🔍", label: "Just browsing" }],
  "Services": [{ icon: "✂️", label: "Regular visit" }, { icon: "🆕", label: "First time here" }, { icon: "🎁", label: "Gift for someone" }, { icon: "💼", label: "Special occasion" }],
  "Health": [{ icon: "💪", label: "First class" }, { icon: "🔄", label: "Regular member" }, { icon: "🎁", label: "Guest of a member" }, { icon: "🏆", label: "Working toward a goal" }],
  "default": [{ icon: "🆕", label: "First time here" }, { icon: "🔄", label: "Regular visitor" }, { icon: "🎁", label: "Someone's guest" }, { icon: "💼", label: "Special occasion" }],
}

const reviewPrompts: Record<string, string> = {
  "Fine Dining": "Share your honest experience. Consider: Were the ingredients fresh and quality? Did the cooking show real skill? Did the flavors come together? Was there something unique about this place? Would others get the same experience you did?",
  "Italian Restaurant": "Share your honest experience. Consider: Were the ingredients fresh and quality? Did the cooking show real skill? Did the flavors come together? Was there something unique about this place? Would others get the same experience you did?",
  "Mexican Restaurant": "Share your honest experience. Consider: Were the ingredients fresh and quality? Did the cooking show real skill? Did the flavors come together? Was there something unique about this place? Would others get the same experience you did?",
  "Asian Restaurant": "Share your honest experience. Consider: Were the ingredients fresh and quality? Did the cooking show real skill? Did the flavors come together? Was there something unique about this place? Would others get the same experience you did?",
  "Experience": "Share your honest experience. Consider: Was the quality what you expected? Did it show real craft or skill? Was there something unique about it? Would others get the same experience you did?",
  "Fitness": "Share your honest experience. Consider: Was the instruction quality high? Did the environment support your goals? Was there something unique about this place? Would you get the same experience every visit?",
  "default": "Share your honest experience. Consider: Was the quality there? Did it show real skill or craft? Was there something unique about this place? Would others get the same experience you did?",
}

function ReviewForm() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [selectedBiz, setSelectedBiz] = useState<any>(null)
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState("")
  const [contextTag, setContextTag] = useState("")
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedStars, setSubmittedStars] = useState(0)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const bizId = searchParams.get("business")

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
      if (!data.user) router.push("/signup")
    })
    supabase.from("businesses").select("id, name, category, city, state").then(({ data }) => {
      const bizList = data || []
      setBusinesses(bizList)
      if (bizId) {
        const found = bizList.find((b: any) => b.id === bizId)
        if (found) setSelectedBiz(found)
      }
    })
  }, [bizId])

  const tags = selectedBiz ? contextTags[selectedBiz.category] || contextTags.default : contextTags.default
  const prompt = selectedBiz ? reviewPrompts[selectedBiz.category] || reviewPrompts.default : reviewPrompts.default

  async function handleSubmit() {
    if (!selectedBiz) { setError("Please select a business"); return }
    if (stars === 0) { setError("Please add a star rating"); return }
    if (!contextTag) { setError("Please select your visit context"); return }
    if (text.trim().length < 10) { setError("Please write at least a sentence about your experience"); return }

    setSubmitting(true)
    setError("")

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fullName = user.user_metadata?.full_name || "Reviu Member"
    const initials = fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    const isPending = stars <= 3
    const canUpgrade = stars === 4

    const { error } = await supabase.from("reviews").insert({
      business_id: selectedBiz.id,
      user_id: user.id,
      stars,
      text: text.trim(),
      context_tag: contextTag,
      is_first_visit: isFirstVisit,
      business_category: selectedBiz.category,
      reviewer_name: fullName,
      reviewer_initials: initials,
      status: isPending ? "pending" : "published",
      can_upgrade: canUpgrade,
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      setSubmittedStars(stars)
      setSubmitted(true)
    }
  }

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#888" }}>Loading...</div>
    </div>
  )

  if (submitted) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>{submittedStars >= 4 ? "🎉" : "⏳"}</div>
      <div style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>
        {submittedStars >= 4 ? "Review is live!" : "Review submitted"}
      </div>
      <div style={{ fontSize: "14px", color: "#888", marginBottom: "16px", lineHeight: "1.6" }}>
        {submittedStars <= 3
          ? "The business has 72 hours to reach out and make it right. If resolved, you can upgrade your rating. Otherwise it goes public automatically."
          : submittedStars === 4
          ? "Your 4-star review is live. If the business reaches out and resolves any concerns, you have the option to upgrade it to 5 stars."
          : "Your 5-star review is live on Reviu. Thank you for helping others discover great businesses!"}
      </div>
      {submittedStars <= 3 && (
        <div style={{ background: "#FAEEDA", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#854F0B", lineHeight: "1.6", width: "100%", textAlign: "left" }}>
          <strong>How the 72hr window works:</strong> The business sees your review privately and can message you to resolve the issue. If they make it right, you can upgrade your rating. If 72 hours pass with no resolution, your review posts exactly as written.
        </div>
      )}
      {submittedStars === 4 && (
        <div style={{ background: "#EEEDFE", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#3C3489", lineHeight: "1.6", width: "100%", textAlign: "left" }}>
          <strong>4-star upgrade option:</strong> If the business reaches out and exceeds your expectations, you can upgrade this to a 5-star review from your profile.
        </div>
      )}
      <Link href="/" style={{ display: "block", background: "#534AB7", color: "white", padding: "14px 32px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textDecoration: "none", marginBottom: "12px", width: "100%", textAlign: "center" }}>
        Back to home
      </Link>
      <Link href={`/business/${selectedBiz?.id}`} style={{ display: "block", background: "white", color: "#534AB7", padding: "14px 32px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textDecoration: "none", border: "1px solid #534AB7", width: "100%", textAlign: "center" }}>
        View business page
      </Link>
    </div>
  )

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href={selectedBiz ? `/business/${selectedBiz.id}` : "/"} style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <span style={{ fontSize: "16px", fontWeight: "600", color: "white" }}>Write a Review</span>
      </div>

      <div style={{ padding: "1rem" }}>
        <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Which business?</div>
          {!selectedBiz ? (
            <>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search businesses..." style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", boxSizing: "border-box", marginBottom: "10px" }} />
              {businesses.filter(b => b.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5).map(biz => (
                <div key={biz.id} onClick={() => setSelectedBiz(biz)} style={{ padding: "12px", borderRadius: "10px", background: "#f7f7f5", marginBottom: "8px", fontSize: "14px", cursor: "pointer", border: "1px solid #eee" }}>
                  <div style={{ fontWeight: "600" }}>{biz.name}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>{biz.category} · {biz.city}, {biz.state}</div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "600", fontSize: "15px" }}>{selectedBiz.name}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{selectedBiz.category} · {selectedBiz.city}</div>
              </div>
              {!bizId && <div onClick={() => { setSelectedBiz(null); setContextTag("") }} style={{ fontSize: "12px", color: "#534AB7", cursor: "pointer", fontWeight: "600" }}>Change</div>}
            </div>
          )}
        </div>

        {selectedBiz && (
          <>
            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>What brought you here?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {tags.map(tag => (
                  <div key={tag.label} onClick={() => setContextTag(tag.label)} style={{ padding: "12px", borderRadius: "12px", border: contextTag === tag.label ? "2px solid #534AB7" : "1px solid #eee", background: contextTag === tag.label ? "#EEEDFE" : "#f7f7f5", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: "22px", marginBottom: "4px" }}>{tag.icon}</div>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: contextTag === tag.label ? "#534AB7" : "#555" }}>{tag.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Your rating</div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "8px" }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} onClick={() => setStars(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} style={{ fontSize: "40px", cursor: "pointer", color: star <= (hover || stars) ? "#534AB7" : "#ddd", transition: "color 0.1s" }}>✦</span>
                ))}
              </div>
              <div style={{ textAlign: "center", fontSize: "13px", fontWeight: "500", color: "#888" }}>
                {stars === 0 && "Tap to rate"}
                {stars === 1 && "Poor"}
                {stars === 2 && "Fair"}
                {stars === 3 && "Good"}
                {stars === 4 && "Very good"}
                {stars === 5 && "Excellent"}
              </div>
              {stars > 0 && stars <= 3 && (
                <div style={{ marginTop: "10px", background: "#FAEEDA", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", color: "#854F0B", lineHeight: "1.5" }}>
                  ⏱ Reviews with 3 ✦ or under enter a 72-hour window where the business can reach out to resolve your experience before it goes public.
                </div>
              )}
              {stars === 4 && (
                <div style={{ marginTop: "10px", background: "#EEEDFE", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", color: "#3C3489", lineHeight: "1.5" }}>
                  ✦ Your 4 ✦ review posts immediately. If the business reaches out and makes it right, you can upgrade it to 5 ✦ from your profile.
                </div>
              )}
            </div>

            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Your experience</div>
              <textarea value={text} onChange={e => setText(e.target.value)} placeholder={prompt} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", minHeight: "150px", resize: "none", boxSizing: "border-box", lineHeight: "1.6", fontFamily: "sans-serif" }} />
              <div style={{ fontSize: "12px", color: "#aaa", marginTop: "6px" }}>{text.length} characters</div>
            </div>

            <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600" }}>First time visiting?</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>Helps others know if this is a first impression</div>
                </div>
                <div onClick={() => setIsFirstVisit(!isFirstVisit)} style={{ width: "48px", height: "28px", borderRadius: "14px", background: isFirstVisit ? "#534AB7" : "#ddd", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "white", position: "absolute", top: "3px", left: isFirstVisit ? "23px" : "3px", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            </div>

            <div style={{ background: "#EEEDFE", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#3C3489", lineHeight: "1.6" }}>
              ✦ <strong>Reviu Score:</strong> Your review and account history are used to calculate your Reviu Score — a measure of how legitimate and trustworthy your reviews are.
            </div>

            {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}

            <div onClick={handleSubmit} style={{ background: submitting ? "#9990D9" : "#534AB7", color: "white", padding: "16px", borderRadius: "14px", fontSize: "15px", fontWeight: "600", textAlign: "center", cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "Submitting..." : "Submit review"}
            </div>
          </>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px" }}>
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊞</span><span style={{ fontSize: "11px", color: "#888" }}>Home</span></Link>
        <Link href="/post-review" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>⊕</span><span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>Review</span></Link>
        <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>✦</span><span style={{ fontSize: "11px", color: "#888" }}>Influencers</span></Link>
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}><span style={{ fontSize: "20px" }}>◯</span><span style={{ fontSize: "11px", color: "#888" }}>Profile</span></Link>
      </div>
    </div>
  )
}

export default function PostReview() {
  return (
    <Suspense fallback={<div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#888" }}>Loading...</div></div>}>
      <ReviewForm />
    </Suspense>
  )
}