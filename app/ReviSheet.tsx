"use client"
import { useState, useEffect, useRef } from "react"
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
- You love Cincinnati and know the food scene well

When someone asks for recommendations give 2-3 specific suggestions with a brief reason why.`

interface Message {
  role: "user" | "assistant"
  content: string
}

const SUGGESTIONS = [
  "What's good downtown?",
  "Best date night spot?",
  "Quick lunch near me?",
  "What's special today?",
]

export default function ReviSheet({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm Revi ✦ How can I help you today?" }
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
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, had a hiccup. Try again!" }])
    }
    setLoading(false)
  }

  if (!open) return null

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }} />
      <div style={{ position: "fixed", bottom: "64px", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", height: "65vh", background: "white", borderRadius: "20px 20px 0 0", zIndex: 201, display: "flex", flexDirection: "column", boxShadow: "0 -4px 30px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "12px 1.25rem 0", flexShrink: 0 }}>
          <div style={{ width: "36px", height: "4px", background: "#ddd", borderRadius: "2px", margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "white" }}>✦</div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>Revi</div>
              <div style={{ fontSize: "11px", color: "#888" }}>Your Cincinnati guide</div>
            </div>
            <div onClick={onClose} style={{ marginLeft: "auto", fontSize: "20px", color: "#888", cursor: "pointer", padding: "4px" }}>✕</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "6px" }}>
              {msg.role === "assistant" && (
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "white", flexShrink: 0 }}>✦</div>
              )}
              <div style={{ maxWidth: "78%", padding: "9px 13px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "user" ? "#534AB7" : "#f0f0f0", color: msg.role === "user" ? "white" : "#111", fontSize: "14px", lineHeight: "1.5" }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "white", flexShrink: 0 }}>✦</div>
              <div style={{ padding: "9px 13px", borderRadius: "16px 16px 16px 4px", background: "#f0f0f0" }}>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#534AB7", opacity: 0.5 }} />)}
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
              {SUGGESTIONS.map(s => (
                <div key={s} onClick={() => sendMessage(s)} style={{ padding: "7px 12px", borderRadius: "20px", background: "white", border: "1px solid #e5e5e5", fontSize: "12px", color: "#534AB7", cursor: "pointer", fontWeight: "500" }}>
                  {s}
                </div>
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
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              placeholder="Ask Revi anything..."
              rows={1}
              style={{ flex: 1, padding: "10px 14px", borderRadius: "20px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f7f7f5", resize: "none", fontFamily: "sans-serif", outline: "none", lineHeight: "1.4" }}
            />
            <div onClick={() => sendMessage(input)} style={{ width: "38px", height: "38px", borderRadius: "50%", background: input.trim() ? "#534AB7" : "#ddd", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed", flexShrink: 0 }}>
              <span style={{ color: "white", fontSize: "16px" }}>↑</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}