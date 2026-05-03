import { prisma } from "@/lib/prisma"

export const GOAL_AMOUNT = 100_000
export const MILESTONES = [1000, 5000, 10000, 25000, 50000, 100000]

export async function getExperimentStats() {
  const [totals, groupedCountries, latest] = await Promise.all([
    prisma.order.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.order.groupBy({
      by: ["country"],
      _sum: { amount: true },
      _count: { country: true },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  const totalAmount = totals._sum.amount ?? 0
  const totalDonations = totals._count.id ?? 0
  const countryCount = groupedCountries.length

  const topCountries = groupedCountries.map((item) => ({
    country: item.country,
    totalAmount: item._sum.amount ?? 0,
    donations: item._count.country ?? 0,
  }))

  return {
    totalAmount,
    totalDonations,
    countryCount,
    goalAmount: GOAL_AMOUNT,
    progress: Math.min(totalAmount / GOAL_AMOUNT, 1),
    topCountries,
    latest,
  }
}

export async function isFirstDonationForCountry(country: string) {
  const existing = await prisma.order.findFirst({
    where: { country },
    select: { id: true },
  })

  return !existing
}

export function getReachedMilestone(previousTotal: number, newTotal: number) {
  return MILESTONES.find(
    (milestone) => previousTotal < milestone && newTotal >= milestone
  )
}