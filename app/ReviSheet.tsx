"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

const accent = "#534AB7"

interface Chip { label: string; query: string }
interface Message {
  role: "user" | "assistant"
  content?: string
  places?: any[]
  chips?: Chip[]
  premium?: boolean
}

const STARTERS: Chip[] = [
  { label: "Good food", query: "good restaurant" },
  { label: "Drinks", query: "good bar for drinks" },
  { label: "Coffee", query: "best coffee shop" },
  { label: "Date night", query: "romantic restaurant" },
]

const REFINE_FOOD = ["food", "eat", "hungry", "dinner", "lunch", "restaurant", "restaurants"]
const REFINE_DRINK = ["drink", "drinks", "bar", "bars", "go out", "night out"]
const PREMIUM_HINTS = ["plan", "surprise", "should i", "what do you think", "tell me", "itinerary", "feel like", "recommend a", "help me decide", "my mood"]

function photoUrl(name: string) {
  return `https://places.googleapis.com/v1/${name}/media?maxWidthPx=400&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
}

function categoryLabel(types: string[] = []) {
  const map: Record<string, string> = {
    fine_dining_restaurant: "Fine Dining", italian_restaurant: "Italian",
    mexican_restaurant: "Mexican", chinese_restaurant: "Chinese",
    japanese_restaurant: "Japanese", pizza_restaurant: "Pizza",
    sushi_restaurant: "Sushi", steak_house: "Steakhouse",
    seafood_restaurant: "Seafood", brewery: "Brewery", bar: "Bar",
    cocktail_bar: "Cocktail Bar", cafe: "Cafe", coffee_shop: "Coffee",
    bakery: "Bakery", restaurant: "Restaurant", hotel: "Hotel",
    lodging: "Hotel", spa: "Spa", beauty_salon: "Beauty",
    hair_care: "Hair", gym: "Gym", night_club: "Nightclub",
  }
  for (const t of types) if (map[t]) return map[t]
  const first = types.find((t) => t !== "point_of_interest" && t !== "establishment" && t !== "food")
  return first ? first.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Place"
}

export default function ReviSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm Revi ✦ What are you in the mood for?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, loading])

  useEffect(() => {
    if (open && !coords && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      )
    }
  }, [open, coords])

  function pushAssistant(msg: Omit<Message, "role">) {
    setMessages(prev => [...prev, { role: "assistant", ...msg }])
  }

  async function googleSearch(query: string) {
    setLoading(true)
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, lat: coords?.lat, lng: coords?.lng }),
      })
      const data = await res.json()
      const places = (data.places || []).slice(0, 6)
      if (places.length === 0) {
        pushAssistant({ content: "I couldn't find anything for that. Try different words — or ask Revi Premium for a more personal answer.", premium: true })
      } else {
        pushAssistant({ content: "Here are some spots near you:", places })
      }
    } catch {
      pushAssistant({ content: "Something went wrong — try again in a sec." })
    }
    setLoading(false)
  }

  function handle(text: string) {
    const clean = text.trim()
    if (!clean || loading) return
    setMessages(prev => [...prev, { role: "user", content: clean }])
    setInput("")
    const lower = clean.toLowerCase()

    if (PREMIUM_HINTS.some(h => lower.includes(h))) {
      pushAssistant({ content: "That's the kind of open-ended question Revi Premium is built for — real conversation and picks made just for you.", premium: true })
      return
    }
    if (REFINE_FOOD.includes(lower)) {
      pushAssistant({ content: "Nice — what are you feeling?", chips: [
        { label: "Pasta", query: "best pasta" },
        { label: "Steak", query: "best steakhouse" },
        { label: "Sushi", query: "best sushi" },
        { label: "Pizza", query: "best pizza" },
        { label: "Burgers", query: "best burgers" },
        { label: "Anything good", query: "good restaurant" },
      ] })
      return
    }
    if (REFINE_DRINK.includes(lower)) {
      pushAssistant({ content: "What kind of spot?", chips: [
        { label: "Cocktails", query: "cocktail bar" },
        { label: "Brewery", query: "brewery" },
        { label: "Wine bar", query: "wine bar" },
        { label: "Lively bar", query: "popular bar" },
      ] })
      return
    }
    googleSearch(clean)
  }

  if (!open) return null

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }} />
      <div style={{ position: "fixed", bottom: "64px", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", height: "65vh", background: "white", borderRadius: "20px 20px 0 0", zIndex: 201, display: "flex", flexDirection: "column", boxShadow: "0 -4px 30px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "12px 1.25rem 0", flexShrink: 0 }}>
          <div style={{ width: "36px", height: "4px", background: "#ddd", borderRadius: "2px", margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "white" }}>✦</div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>Revi</div>
              <div style={{ fontSize: "11px", color: "#888" }}>Find your next spot</div>
            </div>
            <div onClick={onClose} style={{ marginLeft: "auto", fontSize: "20px", color: "#888", cursor: "pointer", padding: "4px" }}>✕</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages.map((msg, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "6px" }}>
                {msg.role === "assistant" && (
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "white", flexShrink: 0 }}>✦</div>
                )}
                {msg.content && (
                  <div style={{ maxWidth: "78%", padding: "9px 13px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "user" ? accent : "#f0f0f0", color: msg.role === "user" ? "white" : "#111", fontSize: "14px", lineHeight: "1.5" }}>
                    {msg.content}
                  </div>
                )}
              </div>

              {msg.places && (
                <div style={{ marginTop: "8px", marginLeft: "30px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {msg.places.map((p: any) => (
                    <Link key={p.id} href={`/search/${p.id}`} onClick={onClose} style={{ display: "flex", gap: "10px", background: "white", borderRadius: "12px", padding: "8px", textDecoration: "none", border: "1px solid rgba(83,74,183,0.2)", alignItems: "center" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "rgba(83,74,183,0.12)" }}>
                        {p.photos?.[0] && <img src={photoUrl(p.photos[0].name)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.displayName?.text}</div>
                        <div style={{ fontSize: "11px", color: accent, fontWeight: 600 }}>{categoryLabel(p.types)}</div>
                        <div style={{ fontSize: "11px", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.formattedAddress}</div>
                      </div>
                      {p.currentOpeningHours?.openNow !== undefined && (
                        <div style={{ fontSize: "9px", fontWeight: 700, padding: "3px 7px", borderRadius: "10px", flexShrink: 0, background: p.currentOpeningHours.openNow ? "#EAF3DE" : "#FAEEDA", color: p.currentOpeningHours.openNow ? "#3B6D11" : "#854F0B" }}>{p.currentOpeningHours.openNow ? "Open" : "Closed"}</div>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {msg.chips && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px", marginLeft: "30px" }}>
                  {msg.chips.map(c => (
                    <div key={c.label} onClick={() => handle(c.query)} style={{ padding: "7px 12px", borderRadius: "20px", background: "white", border: "1px solid #e5e5e5", fontSize: "12px", color: accent, cursor: "pointer", fontWeight: 600 }}>{c.label}</div>
                  ))}
                </div>
              )}

              {msg.premium && (
                <div onClick={() => pushAssistant({ content: "Revi Premium is coming soon — stay tuned ✦" })} style={{ marginTop: "8px", marginLeft: "30px", display: "inline-block", padding: "9px 14px", borderRadius: "20px", background: accent, color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                  Unlock Revi Premium ✦
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "white", flexShrink: 0 }}>✦</div>
              <div style={{ padding: "9px 13px", borderRadius: "16px 16px 16px 4px", background: "#f0f0f0" }}>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: accent, opacity: 0.5 }} />)}
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
              {STARTERS.map(s => (
                <div key={s.label} onClick={() => handle(s.query)} style={{ padding: "7px 12px", borderRadius: "20px", background: "white", border: "1px solid #e5e5e5", fontSize: "12px", color: accent, cursor: "pointer", fontWeight: 500 }}>{s.label}</div>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: "10px 1.25rem 16px", borderTop: "1px solid #eee", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handle(input) } }}
              placeholder="Tell Revi what you're craving..."
              rows={1}
              style={{ flex: 1, padding: "10px 14px", borderRadius: "20px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", resize: "none", fontFamily: "sans-serif", outline: "none", lineHeight: "1.4" }}
            />
            <div onClick={() => handle(input)} style={{ width: "38px", height: "38px", borderRadius: "50%", background: input.trim() ? accent : "#ddd", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed", flexShrink: 0 }}>
              <span style={{ color: "white", fontSize: "16px" }}>↑</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}