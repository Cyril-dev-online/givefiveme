import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000)
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [
      totalAggregate,
      groupedByCountry,
      latestOrders,
      latestNewCountry,
      ordersLastHour,
      allOrdersForTimeline,
      ordersLast24h,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { amount: true },
        _count: { id: true },
      }),

      prisma.order.groupBy({
        by: ["country"],
        _sum: { amount: true },
        _count: { country: true },
      }),

      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          country: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          isFirstCountry: true,
        },
      }),

      prisma.order.findFirst({
        where: {
          isFirstCountry: true,
        },
        orderBy: { createdAt: "desc" },
        select: {
          country: true,
          createdAt: true,
        },
      }),

      prisma.order.findMany({
        where: {
          createdAt: {
            gte: lastHour,
          },
        },
        select: {
          amount: true,
        },
      }),

      prisma.order.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          amount: true,
          createdAt: true,
        },
      }),

      prisma.order.findMany({
        where: {
          createdAt: {
            gte: last24h,
          },
        },
        select: {
          amount: true,
          country: true,
          isFirstCountry: true,
        },
      }),
    ])

    const totalAmount = totalAggregate._sum.amount ?? 0
    const totalDonations = totalAggregate._count.id ?? 0

    const countryDistribution = groupedByCountry
      .filter((item) => item.country)
      .map((item) => ({
        country: item.country as string,
        amount: item._sum.amount ?? 0,
        donations: item._count.country,
      }))
      .sort(
        (a, b) =>
          b.donations - a.donations || a.country.localeCompare(b.country)
      )

    const topCountries = countryDistribution.slice(0, 5)
    const countryCount = countryDistribution.length

    const momentumAmount1h = ordersLastHour.reduce(
      (sum, order) => sum + order.amount,
      0
    )

    const momentumParticipants1h = ordersLastHour.length

    const newCountries24h = ordersLast24h.filter(
      (order) => order.isFirstCountry
    ).length

    const donations24hByCountry = new Map<
      string,
      { country: string; donations24h: number; amount24h: number }
    >()

    for (const order of ordersLast24h) {
      const country = order.country || "Unknown"
      const current = donations24hByCountry.get(country)

      if (current) {
        current.donations24h += 1
        current.amount24h += order.amount
      } else {
        donations24hByCountry.set(country, {
          country,
          donations24h: 1,
          amount24h: order.amount,
        })
      }
    }

    const fastestGrowingCountry =
      Array.from(donations24hByCountry.values()).sort(
        (a, b) =>
          b.donations24h - a.donations24h ||
          b.amount24h - a.amount24h ||
          a.country.localeCompare(b.country)
      )[0] ?? null

    const mostActive24h = fastestGrowingCountry
      ? {
          country: fastestGrowingCountry.country,
          donations: fastestGrowingCountry.donations24h,
          amount: fastestGrowingCountry.amount24h,
        }
      : null

    let cumulativeAmount = 0
    let cumulativeDonations = 0

    const timeline = allOrdersForTimeline.map((order) => {
      cumulativeAmount += order.amount
      cumulativeDonations += 1

      return {
        date: order.createdAt.toISOString(),
        amount: order.amount,
        donations: 1,
        cumulativeAmount,
        cumulativeDonations,
      }
    })

    let countryStatus: {
      leader: string
      challenger: string | null
      gap: number
      message: string
    } | null = null

    if (topCountries.length === 1) {
      countryStatus = {
        leader: topCountries[0].country,
        challenger: null,
        gap: 0,
        message: `${topCountries[0].country} is leading the experiment`,
      }
    } else if (topCountries.length >= 2) {
      const leader = topCountries[0]
      const challenger = topCountries[1]
      const gap = leader.donations - challenger.donations

      countryStatus = {
        leader: leader.country,
        challenger: challenger.country,
        gap,
        message:
          gap === 0
            ? `${challenger.country} is tied with ${leader.country} right now`
            : `${challenger.country} needs ${gap} more ${
                gap === 1 ? "person" : "people"
              } to overtake ${leader.country}`,
      }
    }

    let countryBattle: {
      leader: {
        country: string
        donations: number
      }
      challenger: {
        country: string
        donations: number
      }
      gap: number
      message: string
    } | null = null

    if (topCountries.length >= 2) {
      let bestPair:
        | {
            leader: (typeof topCountries)[number]
            challenger: (typeof topCountries)[number]
            gap: number
          }
        | null = null

      for (let i = 0; i < topCountries.length - 1; i++) {
        const leader = topCountries[i]
        const challenger = topCountries[i + 1]
        const gap = leader.donations - challenger.donations

        if (!bestPair || gap < bestPair.gap) {
          bestPair = { leader, challenger, gap }
        }
      }

      if (bestPair) {
        countryBattle = {
          leader: {
            country: bestPair.leader.country,
            donations: bestPair.leader.donations,
          },
          challenger: {
            country: bestPair.challenger.country,
            donations: bestPair.challenger.donations,
          },
          gap: bestPair.gap,
          message:
            bestPair.gap === 0
              ? `${bestPair.challenger.country} is tied with ${bestPair.leader.country}`
              : `${bestPair.challenger.country} needs ${bestPair.gap} more ${
                  bestPair.gap === 1 ? "person" : "people"
                } to overtake ${bestPair.leader.country}`,
        }
      }
    }

    return NextResponse.json({
      totalAmount,
      totalDonations,
      countryCount,
      topCountries,
      countryDistribution,
      timeline,
      latest: latestOrders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
      })),
      latestNewCountry: latestNewCountry
        ? {
            country: latestNewCountry.country,
            createdAt: latestNewCountry.createdAt.toISOString(),
          }
        : null,
      mostActive24h,
      fastestGrowingCountry,
      momentum: {
        amount1h: momentumAmount1h,
        participants1h: momentumParticipants1h,
        newCountries24h,
      },
      countryStatus,
      countryBattle,
    })
  } catch (error) {
    console.error("Failed to load stats:", error)

    return NextResponse.json(
      {
        error: "Failed to load stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}