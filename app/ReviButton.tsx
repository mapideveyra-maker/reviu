"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ReviButton() {
  const [visible, setVisible] = useState(false)
  const [pulsing, setPulsing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
      setTimeout(() => setPulsing(true), 500)
      setTimeout(() => setPulsing(false), 3500)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

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
          animation: "fadeIn 0.3s ease",
        }}>
          Need help finding something? ✦
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
        transition: "transform 0.2s",
      }}>
        ✦
      </div>
    </div>
  )
}