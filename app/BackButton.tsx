"use client"
export default function BackButton() {
  return (
    <div
      onClick={() => window.history.back()}
      style={{ position: "absolute", top: "16px", left: "16px", width: "36px", height: "36px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", zIndex: 20 }}
    >
      ←
    </div>
  )
}