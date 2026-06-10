import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { query } = await request.json()
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`
    )
    const data = await res.json()
    // keep only city/locality-type results
    const cities = (data.results || [])
      .filter((r: any) =>
        (r.types || []).some((t: string) =>
          ["locality", "administrative_area_level_1", "administrative_area_level_2", "postal_town"].includes(t)
        )
      )
      .map((r: any) => ({
        id: r.place_id,
        name: r.formatted_address,
        lat: r.geometry?.location?.lat,
        lng: r.geometry?.location?.lng,
      }))
      .filter((c: any) => typeof c.lat === "number" && typeof c.lng === "number")
    return NextResponse.json({ cities })
  } catch (error: any) {
    return NextResponse.json({ cities: [], error: error.message }, { status: 200 })
  }
}