"use client"
import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export default function FeedMap({
  userLocation,
  places,
  onPinSelect,
}: {
  userLocation: { lat: number; lng: number }
  places: any[]
  onPinSelect: (place: any) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map)

    L.marker([userLocation.lat, userLocation.lng], {
      icon: L.divIcon({
        className: "reviu-pin-user",
        html: "<div></div>",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
      zIndexOffset: 1000,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = []
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    places.forEach((place: any) => {
      const lat = place.location?.latitude
      const lng = place.location?.longitude
      if (!lat || !lng) return

      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "reviu-pin-place",
          html: "<div></div>",
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        }),
      })
        .addTo(mapRef.current!)
        .on("click", () => onPinSelect(place))

      markersRef.current.push(marker)
    })
  }, [places])

  return (
    <>
      <style>{`
        .reviu-pin-user, .reviu-pin-place {
          background: transparent !important;
          border: none !important;
        }
        .reviu-pin-user div {
          width: 16px; height: 16px;
          background: #4285F4;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .reviu-pin-place div {
          width: 12px; height: 12px;
          background: #534AB7;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 6px rgba(83,74,183,0.6);
        }
      `}</style>
      <div ref={containerRef} style={{ width: "100%", height: "220px" }} />
    </>
  )
}
