"use client"
import { useState } from "react"

export default function MediaViewer({ urls }: { urls: string[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  if (!urls || urls.length === 0) return null

  return (
    <>
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
        {urls.map((url, i) => (
          <div key={i} onClick={() => setSelected(url)} style={{ flexShrink: 0, cursor: "pointer" }}>
            {url.match(/\.(mp4|mov|webm)/i) ? (
              <video src={url} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px" }} />
            ) : (
              <img src={url} alt={`Media ${i+1}`} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px" }} />
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ position: "absolute", top: "16px", right: "16px", color: "white", fontSize: "28px", cursor: "pointer", fontWeight: "300" }}>✕</div>
          {selected.match(/\.(mp4|mov|webm)/i) ? (
            <video src={selected} controls autoPlay style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "12px" }} />
          ) : (
            <img src={selected} alt="Full size" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "12px", objectFit: "contain" }} onClick={e => e.stopPropagation()} />
          )}
        </div>
      )}
    </>
  )
}