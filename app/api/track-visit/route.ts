import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    let body = {}

    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const { country, city, latitude, longitude } = body as {
      country?: string
      city?: string
      latitude?: number | null
      longitude?: number | null
    }

    await prisma.visit.create({
      data: {
        country: country || "Unknown",
        city: city || "Unknown",
        latitude: typeof latitude === "number" ? latitude : null,
        longitude: typeof longitude === "number" ? longitude : null,
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("track-visit error:", error)
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}