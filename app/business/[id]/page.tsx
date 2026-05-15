import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { messages, system, userId } = await request.json()

    let personalContext = ""

    if (userId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const [prefsRes, reviewsRes] = await Promise.all([
        supabase
          .from("user_preferences")
          .select("category, action, businesses(name)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("reviews")
          .select("stars, businesses(name, category)")
          .eq("user_id", userId)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(10),
      ])

      const viewed = prefsRes.data?.filter(p => p.action === "viewed").map((p: any) => p.businesses?.name).filter(Boolean) || []
      const highRated = reviewsRes.data?.filter(r => r.stars >= 4).map((r: any) => `${r.businesses?.name} (${r.stars}✦)`).filter(Boolean) || []
      const categories = [...new Set(prefsRes.data?.map(p => p.category).filter(Boolean))] || []

      if (viewed.length > 0 || highRated.length > 0) {
        personalContext = `

User's personal context:
- Recently viewed: ${viewed.slice(0, 5).join(", ") || "nothing yet"}
- Highly rated by this user: ${highRated.slice(0, 5).join(", ") || "nothing yet"}
- Categories they explore: ${categories.join(", ") || "varies"}

Use this to give personalized recommendations. Suggest places they haven't tried yet that match their taste profile.`
      }
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: system + personalContext,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    })

    return NextResponse.json({
      response: response.content[0].type === "text" ? response.content[0].text : "Sorry I could not process that.",
    })
  } catch (error: any) {
    console.error("Revi API error:", error)
    return NextResponse.json({
      response: "I am having a moment — try again in a second!",
    })
  }
}