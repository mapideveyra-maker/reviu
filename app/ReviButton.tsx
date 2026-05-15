"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
export default function ReviButton() {
  const [pulsing, setPulsing] = useState(true)
  const router = useRouter()
  useEffect(() => {
    setTimeout(() => setPulsing(false), 3000)
  }, [])
  return (
    <div
      onClick={() => router.push("/revi")}
      style={{
        position: "fixed",
        bottom: "90px",
        right: "16px",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
      }}
    >
      {pulsing && (
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "8px 14px",
          fontSize: "12px",
          fontWeight: "600",
          color: "#534AB7",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          whiteSpace: "nowrap",
        }}>
          Ask Revi ✦
        </div>
      )}
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "#534AB7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        color: "white",
        boxShadow: "0 4px 16px rgba(83,74,183,0.4)",
        border: "3px solid white",
      }}>
        ✦
      </div>
    </div>
  )
}