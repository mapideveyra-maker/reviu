"use client"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export default function FollowButton({ businessId, userId, initialFollowing, accentColor }: { businessId: string, userId: string | null, initialFollowing: boolean, accentColor: string }) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggleFollow() {
    if (!userId) { router.push("/signup"); return }
    setLoading(true)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    if (following) {
      await supabase.from("follows").delete().eq("business_id", businessId).eq("user_id", userId)
      setFollowing(false)
    } else {
      await supabase.from("follows").insert({ business_id: businessId, user_id: userId })
      setFollowing(true)
    }
    setLoading(false)
  }

  return (
    <div
      onClick={toggleFollow}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "12px",
        borderRadius: "12px",
        background: following ? accentColor : "white",
        border: `2px solid ${accentColor}`,
        cursor: loading ? "not-allowed" : "pointer",
        marginBottom: "4px",
        transition: "all 0.2s",
      }}
    >
      <span style={{ fontSize: "16px" }}>{following ? "⭐" : "☆"}</span>
      <span style={{ fontSize: "14px", fontWeight: "600", color: following ? "white" : accentColor }}>
        {loading ? "..." : following ? "Following — get notified of specials" : "Follow for specials and updates"}
      </span>
    </div>
  )
}