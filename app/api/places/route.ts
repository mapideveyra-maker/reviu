import { NextResponse } from "next/server"

const FIELD_MASK =
  "places.id,places.displayName,places.formattedAddress,places.location," +
  "places.rating,places.userRatingCount,places.types,places.photos," +
  "places.currentOpeningHours,places.priceLevel,places.businessStatus"

const CHUNK_SIZE = 1

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function nearbySearch(
  lat: number,
  lng: number,
  radius: number,
  includedTypes: string[],
  apiKey: string,
): Promise<any[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      ...(includedTypes.length > 0 && { includedTypes }),
      maxResultCount: 20,
      rankPreference: "DISTANCE",
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius,
        },
      },
    }),
  })
  const data = await res.json()
  return data.places || []
}

function qualityFilter(places: any[]): any[] {
  return places.filter(
    (p: any) =>
      p.businessStatus !== "CLOSED_PERMANENTLY" &&
      (p.userRatingCount ?? 0) >= 1 &&
      p.formattedAddress?.trim(),
  )
}

function dedup(batches: any[][]): any[] {
  const seen = new Set<string>()
  const out: any[] = []
  for (const batch of batches) {
    for (const place of batch) {
      if (!seen.has(place.id)) {
        seen.add(place.id)
        out.push(place)
      }
    }
  }
  return out
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function closest20(places: any[], lat: number, lng: number): any[] {
  return places
    .map(p => ({ ...p, _dist: p.location ? distanceMeters(lat, lng, p.location.latitude, p.location.longitude) : Infinity }))
    .sort((a, b) => a._dist - b._dist)
    .slice(0, 20)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get("lat")!)
  const lng = parseFloat(searchParams.get("lng")!)
  const radius = parseFloat(searchParams.get("radius") || "5000")
  const minRadius = parseFloat(searchParams.get("minRadius") || "0")
  const typesParam = searchParams.get("types")
  const includedTypes = typesParam ? typesParam.split(",").filter(Boolean) : []
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!

  const chunks: string[][] = includedTypes.length > CHUNK_SIZE
    ? chunkArray(includedTypes, CHUNK_SIZE)
    : [includedTypes]

  try {
    let batches: any[][]

    if (minRadius > 0) {
      const midMeters = (minRadius + radius) / 2
      const halfMeters = (radius - minRadius) / 2
      const latOff = midMeters / 111320
      const lngOff = midMeters / (111320 * Math.cos(lat * Math.PI / 180))

      const centers: [number, number][] = [
        [lat + latOff, lng],
        [lat - latOff, lng],
        [lat, lng + lngOff],
        [lat, lng - lngOff],
      ]

      const calls = centers.flatMap(([cLat, cLng]) =>
        chunks.map(chunk => nearbySearch(cLat, cLng, halfMeters, chunk, apiKey))
      )
      const settled = await Promise.allSettled(calls)
      batches = settled
        .filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled")
        .map(r => r.value)
    } else {
      const settled = await Promise.allSettled(
        chunks.map(chunk => nearbySearch(lat, lng, radius, chunk, apiKey))
      )
      batches = settled
        .filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled")
        .map(r => r.value)
    }

    const deduped = dedup(batches)
    const places = closest20(qualityFilter(deduped), lat, lng)

    console.log(
      `[places GET] minRadius=${minRadius}m radius=${radius}m ` +
      `types=${includedTypes.length} chunks=${chunks.length} ` +
      `centers=${minRadius > 0 ? 4 : 1} raw=${deduped.length} filtered=${places.length}`
    )
    return NextResponse.json({ places })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { query, lat, lng } = await request.json()
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
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
    })
    const data = await res.json()
    const places = qualityFilter(data.places || [])
    return NextResponse.json({ places })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}