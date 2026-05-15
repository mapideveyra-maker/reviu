import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { reviewText, contextTag, isFirstVisit, hasEngaged, reviewCount, hasMedia, mediaCount } = await request.json()

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `You are scoring a restaurant or business review for legitimacy on Reviu. Score this review based on how well it covers these four dimensions:

1. FOOD - Does it mention specific details about the food, dishes, ingredients, taste, presentation?
2. SERVICE - Does it mention how they were treated, staff behavior, attentiveness?
3. AMBIENCE - Does it describe the atmosphere, environment, decor, noise level, vibe?
4. EXPERIENCE - Does it paint an overall picture of what it was actually like to be there?

Review text: "${reviewText}"

Return ONLY a JSON object with no explanation, no markdown, no backticks:
{
  "food": 0-25,
  "service": 0-25,
  "ambience": 0-25,
  "experience": 0-25,
  "total": 0-100,
  "feedback": "one short sentence explaining the score"
}`
        }
      ]
    })

    const text = response.content[0].type === "text" ? response.content[0].text : "{}"
    const clean = text.replace(/```json|```/g, "").trim()
    const scores = JSON.parse(clean)

    let bonus = 0
    if (contextTag) bonus += 5
    if (isFirstVisit !== null && isFirstVisit !== undefined) bonus += 5
    if (hasEngaged) bonus += 10
    if (reviewCount > 5) bonus += 5
    if (reviewCount > 20) bonus += 5
    if (hasMedia) bonus += 10
    if (mediaCount >= 3) bonus += 5

    const finalScore = Math.min(100, scores.total + bonus)

    return NextResponse.json({
      ...scores,
      total: finalScore,
    })

  } catch (error: any) {
    console.error("Score review error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}