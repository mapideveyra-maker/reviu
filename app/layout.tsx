"use client"
import "./globals.css"
import { useState } from "react"
import ReviSheet from "./ReviSheet"
import AuthGate from "./AuthGate"
import Link from "next/link"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [reviOpen, setReviOpen] = useState(false)

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <AuthGate>
          {children}
          <ReviSheet open={reviOpen} onClose={() => setReviOpen(false)} />
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "12px 0 20px", zIndex: 100 }}>
            <div onClick={() => { window.location.href = "/" }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none", cursor: "pointer" }}>
              <span style={{ fontSize: "20px" }}>⊞</span>
              <span style={{ fontSize: "11px", color: "#888" }}>Home</span>
            </div>
            <Link href="/reviews" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
              <span style={{ fontSize: "20px" }}>◈</span>
              <span style={{ fontSize: "11px", color: "#888" }}>Reviews</span>
            </Link>
            <div onClick={() => setReviOpen(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer" }}>
              <span style={{ fontSize: "20px" }}>✦</span>
              <span style={{ fontSize: "11px", color: "#534AB7", fontWeight: "600" }}>Revi</span>
            </div>
            <Link href="/influencers" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
              <span style={{ fontSize: "20px" }}>❖</span>
              <span style={{ fontSize: "11px", color: "#888" }}>Creators</span>
            </Link>
            <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textDecoration: "none" }}>
              <span style={{ fontSize: "20px" }}>◯</span>
              <span style={{ fontSize: "11px", color: "#888" }}>Profile</span>
            </Link>
          </div>
        </AuthGate>
      </body>
    </html>
  )
}