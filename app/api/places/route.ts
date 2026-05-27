import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const radius = searchParams.get("radius") || "5000"
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchNearby`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey!,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.photos,places.currentOpeningHours,places.priceLevel",
        },
        body: JSON.stringify({
          includedTypes: ["restaurant"],
          maxResultCount: 20,
          rankPreference: "DISTANCE",
          locationRestriction: {
            circle: {
              center: { latitude: parseFloat(lat!), longitude: parseFloat(lng!) },
              radius: parseFloat(radius),
            },
          },
        }),
      }
    )
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { query, lat, lng } = await request.json()
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey!,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.photos,places.currentOpeningHours,places.priceLevel",
        },
        body: JSON.stringify({
          textQuery: query,
          ...(lat && lng && {
            locationBias: {
              circle: {
                center: { latitude: lat, longitude: lng },
                radius: 50000,
              },
            },
          }),
        }),
      }
    )
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}