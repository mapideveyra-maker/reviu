"use client"
import { useState } from "react"

export default function DirectionsButton({ name, address, city, state, lat, lng }: {
  name: string
  address: string
  city: string
  state: string
  lat: number
  lng: number
}) {
  const [open, setOpen] = useState(false)
  const encoded = encodeURIComponent(`${name} ${address} ${city} ${state}`)
  const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`
  const appleUrl = `https://maps.apple.com/?daddr=${encoded}`
  const fullAddress = `${address}, ${city}, ${state}`

  return (
    <>
      <div onClick={() => setOpen(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 6px", borderRadius: "12px", textDecoration: "none", cursor: "pointer" }}>
        <span style={{ fontSize: "20px" }}>🗺</span>
        <span style={{ fontSize: "11px", fontWeight: "600" }}>Directions</span>
      </div>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }} />
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderRadius: "20px 20px 0 0", zIndex: 201, padding: "1.25rem" }}>
            <div style={{ width: "36px", height: "4px", background: "#ddd", borderRadius: "2px", margin: "0 auto 16px" }} />
            <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>Get directions</div>
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>{fullAddress}</div>
            <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "12px", background: "#f7f7f5", marginBottom: "8px", textDecoration: "none" }}>
              <span style={{ fontSize: "24px" }}>🗺</span>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>Google Maps</div>
                <div style={{ fontSize: "12px", color: "#888" }}>Open in Google Maps</div>
              </div>
            </a>
            <a href={appleUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "12px", background: "#f7f7f5", marginBottom: "8px", textDecoration: "none" }}>
              <span style={{ fontSize: "24px" }}>🍎</span>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>Apple Maps</div>
                <div style={{ fontSize: "12px", color: "#888" }}>Open in Apple Maps</div>
              </div>
            </a>
            <div onClick={() => { navigator.clipboard?.writeText(fullAddress); setOpen(false) }} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "12px", background: "#f7f7f5", marginBottom: "16px", cursor: "pointer" }}>
              <span style={{ fontSize: "24px" }}>📋</span>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>Copy address</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{fullAddress}</div>
              </div>
            </div>
            <div onClick={() => setOpen(false)} style={{ textAlign: "center", padding: "14px", background: "#f7f7f5", borderRadius: "12px", fontSize: "14px", fontWeight: "600", color: "#534AB7", cursor: "pointer" }}>
              Cancel
            </div>
          </div>
        </>
      )}
    </>
  )
}