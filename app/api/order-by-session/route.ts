import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type ImpactType = "NEW_COUNTRY" | "TOP5" | "BATTLE" | "MOVE"

type ImpactData = {
  country?: string
  countryRank?: number | null
  opponent?: string
  gap?: number
  ahead?: boolean
  target?: string | null
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      )
    }

    console.log("[order-by-session] lookup start", { sessionId })

    const order = await prisma.order.findUnique({
      where: { stripeId: sessionId },
      select: {
        id: true,
        amount: true,
        country: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        isFirstCountry: true,
        impactType: true,
        impactData: true,
      },
    })

    if (!order) {
      console.log("[order-by-session] pending", { sessionId })

      return NextResponse.json(
        { status: "pending" },
        { status: 202 }
      )
    }

    const [totalAggregate, groupedByCountry] = await Promise.all([
      prisma.order.aggregate({
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.order.groupBy({
        by: ["country"],
        _count: { country: true },
      }),
    ])

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

    const countryCount = countryDistribution.length
    const totalAmount = totalAggregate._sum.amount ?? 0
    const totalDonations = totalAggregate._count.id ?? 0

    const rankIndex = countryDistribution.findIndex(
      (item) => item.country === order.country
    )
    const countryRank = rankIndex >= 0 ? rankIndex + 1 : null

    console.log("[order-by-session] found", {
      sessionId,
      orderId: order.id,
      country: order.country,
      countryRank,
    })

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      country: order.country,
      latitude: order.latitude,
      longitude: order.longitude,
      createdAt: order.createdAt.toISOString(),
      isFirstCountry: order.isFirstCountry,
      impactType: (order.impactType ?? "MOVE") as ImpactType,
      impactData: (order.impactData ?? {}) as ImpactData,
      totalAmount,
      totalDonations,
      countryCount,
      countryRank,
    })
  } catch (error) {
    console.error("[order-by-session] failed", error)

    return NextResponse.json(
      { error: "Failed to load order" },
      { status: 500 }
    )
  }
}