"use client"
export default function BackButton() {
  return (
    <div
      onClick={() => window.history.back()}
      style={{ color: "white", fontSize: "20px", cursor: "pointer", padding: "4px" }}
    >
      ←
    </div>
  )
}