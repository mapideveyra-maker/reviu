"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const REVI_PERSONALITY = `You are Revi, the friendly AI assistant for Reviu - a review platform for Cincinnati businesses. You help people discover great local restaurants, businesses and experiences in Cincinnati.

You know about these businesses currently on Reviu:
- Tablespoon Cooking Co. - interactive cooking classes in Over-the-Rhine
- Trilogy Fitness Systems - personalized small group fitness on Ridge Ave
- Jeff Ruby's Steakhouse - premier fine dining steakhouse downtown on Vine St
- Nada - modern Mexican cuisine on Walnut St downtown
- KungFood Amerasia - Asian fusion in Covington KY just across the river
- Corner Dumpling House - handmade dumplings on Montgomery Rd
- Sotto - underground Italian restaurant on 6th St downtown
- Dorothy Lane Market - upscale grocery in Mason OH

Your personality:
- Warm, knowledgeable, like a local friend who knows every great spot
- Concise - keep answers short and conversational
- Never pushy or salesy
- Honest about what you know and don't know
- You love Cincinnati and know the food scene well

When someone asks for recommendations give 2-3 specific suggestions with a brief reason why. Always mention the context - date night, quick lunch, celebration etc.

When you have personal context about the user, use it naturally to give personalized recommendations. Don't mention that you're using their data — just make it feel like you know them well.`

interface Message {
  role: "user" | "assistant"
  content: string
}

const SUGGESTIONS = [
  "What's good downtown tonight?",
  "Best date night spot?",
  "Where for a celebration dinner?",
  "Quick lunch recommendations?",
  "What's special today?",
]

export default function ReviChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm Revi 👋 I know Cincinnati's food and business scene inside out. What are you looking for today?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMessage = { role: "user" as const, content: text.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/revi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          system: REVI_PERSONALITY,
          userId,
        }),
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had a little hiccup. Try again in a second!" }])
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", height: "100vh", background: "#f7f7f5", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <Link href="/" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>✦</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>Revi</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Your Cincinnati guide</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "white", flexShrink: 0, marginRight: "8px", marginTop: "2px" }}>✦</div>
            )}
            <div style={{
              maxWidth: "80%",
              padding: "10px 14px",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: msg.role === "user" ? "#534AB7" : "white",
              color: msg.role === "user" ? "white" : "#111",
              fontSize: "14px",
              lineHeight: "1.5",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "white", flexShrink: 0 }}>✦</div>
            <div style={{ background: "white", padding: "10px 14px", borderRadius: "18px 18px 18px 4px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#534AB7", opacity: 0.5 }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
            {SUGGESTIONS.map(s => (
              <div key={s} onClick={() => sendMessage(s)} style={{ padding: "8px 14px", borderRadius: "20px", background: "white", border: "1px solid #e5e5e5", fontSize: "13px", color: "#534AB7", cursor: "pointer", fontWeight: "500" }}>
                {s}
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: "1rem", background: "white", borderTop: "1px solid #eee", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder="Ask Revi anything about Cincinnati..."
            rows={1}
            style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", resize: "none", fontFamily: "sans-serif", outline: "none", lineHeight: "1.4" }}
          />
          <div
            onClick={() => sendMessage(input)}
            style={{ width: "44px", height: "44px", borderRadius: "50%", background: input.trim() ? "#534AB7" : "#ddd", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed", flexShrink: 0, transition: "background 0.2s" }}
          >
            <span style={{ color: "white", fontSize: "18px" }}>↑</span>
          </div>
        </div>
      </div>
    </div>
  )
}