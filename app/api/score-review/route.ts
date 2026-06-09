import { NextResponse } from "next/server"

// Word lists used to detect whether a review actually describes the experience.
const FOOD_WORDS = ["food","dish","meal","flavor","flavour","taste","tasty","delicious","fresh","menu","ingredient","cooked","portion","drink","cocktail","coffee","dessert","appetizer","entree","sauce","spicy","sweet","savory","plate","course","bite"]
const SERVICE_WORDS = ["service","staff","server","waiter","waitress","host","friendly","attentive","rude","slow","quick","helpful","welcoming","manager","bartender","greeted","accommodating","prompt"]
const AMBIENCE_WORDS = ["atmosphere","ambience","ambiance","vibe","decor","cozy","loud","quiet","music","lighting","seating","clean","comfortable","crowded","spacious","romantic","casual","setting","patio","interior"]

function countMatches(text: string, words: string[]): number {
  let hits = 0
  for (const w of words) {
    if (text.includes(w)) hits++
  }
  return hits
}

// Scores one dimension 0-25 based on how many relevant words appear.
function dimensionScore(matches: number): number {
  if (matches === 0) return 4
  if (matches === 1) return 11
  if (matches === 2) return 17
  if (matches === 3) return 21
  return 25
}

export async function POST(request: Request) {
  try {
    const { reviewText, contextTag, isFirstVisit, hasEngaged, reviewCount, hasMedia, mediaCount } = await request.json()
    const text = (reviewText || "").toLowerCase()
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length

    // Base scores from how specifically the review covers each dimension
    const food = dimensionScore(countMatches(text, FOOD_WORDS))
    const service = dimensionScore(countMatches(text, SERVICE_WORDS))
    const ambience = dimensionScore(countMatches(text, AMBIENCE_WORDS))

    // "Experience" rewards effort/length: a fuller review describes more
    let experience = 4
    if (wordCount >= 15) experience = 10
    if (wordCount >= 40) experience = 16
    if (wordCount >= 80) experience = 21
    if (wordCount >= 130) experience = 25

    let total = food + service + ambience + experience

    // Same bonuses the old version used
    let bonus = 0
    if (contextTag) bonus += 5
    if (isFirstVisit !== null && isFirstVisit !== undefined) bonus += 5
    if (hasEngaged) bonus += 10
    if (reviewCount > 5) bonus += 5
    if (reviewCount > 20) bonus += 5
    if (hasMedia) bonus += 10
    if (mediaCount >= 3) bonus += 5

    const finalScore = Math.min(100, total + bonus)

    let feedback = "Thanks for your review."
    if (finalScore >= 80) feedback = "Detailed, helpful review — great contribution."
    else if (finalScore >= 60) feedback = "Solid review. Adding more detail or photos raises your score."
    else feedback = "Add more about the food, service, and atmosphere to strengthen this review."

    return NextResponse.json({
      food,
      service,
      ambience,
      experience,
      total: finalScore,
      feedback,
    })
  } catch (error: any) {
    console.error("Score review error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}