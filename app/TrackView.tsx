"use client"
import { useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

export default function TrackView({ businessId, category }: { businessId: string, category: string }) {
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from("user_preferences").insert({
        user_id: data.user.id,
        business_id: businessId,
        action: "viewed",
        category,
      })
    })
  }, [businessId])

  return null
}