"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

type Point = { id: string; name: string; lat: number; lng: number; href: string }

export default function FeedMap({ center, points }: { center: { lat: number; lng: number } | null; points: Point[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link")
      link.id = "leaflet-css"
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }

    function loadJs(): Promise<void> {
      return new Promise((resolve, reject) => {
        if ((window as any).L) return resolve()
        const existing = document.getElementById("leaflet-js")
        if (existing) {
          existing.addEventListener("load", () => resolve())
          existing.addEventListener("error", () => reject())
          return
        }
        const s = document.createElement("script")
        s.id = "leaflet-js"
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        s.onload = () => resolve()
        s.onerror = () => reject()
        document.head.appendChild(s)
      })
    }

    loadJs().then(() => {
      if (cancelled || !containerRef.current) return
      if (mapRef.current || (containerRef.current as any)._leaflet_id) return
      const L = (window as any).L
      const start = center ? [center.lat, center.lng] : [39.1031, -84.5120]
      const map = L.map(containerRef.current, {
        center: start, zoom: 13,
        dragging: false, scrollWheelZoom: false, touchZoom: false,
        doubleClickZoom: false, boxZoom: false, keyboard: false, zoomControl: false,
      })
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: "&copy; OpenStreetMap",
      }).addTo(map)
      layerRef.current = L.layerGroup().addTo(map)
      mapRef.current = map
      setReady(true)
      setTimeout(() => { try { map.invalidateSize() } catch {} }, 150)
    }).catch(() => {})

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!ready || !mapRef.current || !layerRef.current) return
    const L = (window as any).L
    layerRef.current.clearLayers()

    const icon = L.divIcon({
      className: "",
      html: `<div style="width:18px;height:18px;border-radius:50% 50% 50% 0;background:#534AB7;border:2px solid white;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
      iconSize: [18, 18], iconAnchor: [9, 18],
    })

    const coords: any[] = []
    points.forEach((p) => {
      if (typeof p.lat !== "number" || typeof p.lng !== "number" || isNaN(p.lat) || isNaN(p.lng)) return
      const m = L.marker([p.lat, p.lng], { icon }).addTo(layerRef.current)
      m.on("click", () => router.push(p.href))
      m.bindTooltip(p.name, { direction: "top", offset: [0, -16] })
      coords.push([p.lat, p.lng])
    })
    if (center) coords.push([center.lat, center.lng])

    if (coords.length === 1) mapRef.current.setView(coords[0], 14)
    else if (coords.length > 1) mapRef.current.fitBounds(coords, { padding: [30, 30], maxZoom: 15 })
  }, [ready, points, center, router])

  return <div ref={containerRef} style={{ height: "180px", width: "100%", background: "#e8e8ef", zIndex: 0 }} />
}