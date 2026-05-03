import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        country: true,
        amount: true,
        impactType: true,
        impactData: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const groupedByCountry = await prisma.order.groupBy({
      by: ["country"],
      _count: { country: true },
    })

    const countryDistribution = groupedByCountry
      .filter((item) => item.country)
      .map((item) => ({
        country: item.country as string,
        donations: item._count.country,
      }))
      .sort(
        (a, b) =>
          b.donations - a.donations || a.country.localeCompare(b.country)
      )

    const rankIndex = countryDistribution.findIndex(
      (item) => item.country === order.country
    )
    const countryRank = rankIndex >= 0 ? rankIndex + 1 : null

    return NextResponse.json({
      id: order.id,
      country: order.country,
      amount: order.amount,
      impactType: order.impactType ?? "MOVE",
      impactData: order.impactData ?? {},
      countryRank,
    })
  } catch (error) {
    console.error("[public-share] failed", error)
    return NextResponse.json(
      { error: "Failed to load share data" },
      { status: 500 }
    )
  }
}