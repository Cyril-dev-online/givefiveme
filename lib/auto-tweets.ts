 import { prisma } from "@/lib/prisma"
import { postTweet } from "@/lib/twitter"

type OrderLike = {
  id: string
  amount: number
  country: string | null
  isFirstCountry: boolean
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
}

function buildNewCountryTweet(country: string) {
  return `🌍 ${country} just joined the experiment.

€5 to join.
No reward.
Live global participation.

${getBaseUrl()}`
}

function buildBattleTweet(challenger: string, leader: string, gap: number) {
  return `${challenger} needs ${gap} more ${
    gap === 1 ? "person" : "people"
  } to overtake ${leader}.

This is getting interesting.

${getBaseUrl()}`
}

function buildTop5Tweet(country: string, gap: number) {
  return `${country} needs ${gap} more ${
    gap === 1 ? "person" : "people"
  } to enter the top 5.

${getBaseUrl()}`
}

async function reserveAndPublishTweet({
  key,
  type,
  text,
}: {
  key: string
  type: string
  text: string
}) {
  try {
    await prisma.autoTweet.create({
      data: {
        key,
        type,
        text,
      },
    })
  } catch {
    // unique constraint or any create failure => treat as already reserved
    return false
  }

  try {
    await postTweet(text)
    return true
  } catch (error) {
    console.error("Tweet publish failed:", error)

    // Keep the reservation to avoid duplicate spam.
    // If you want retries later, add a status field instead of deleting.
    return false
  }
}

export async function maybeTriggerTweetForOrder(order: OrderLike) {
  if (!order.country) return

  if (order.isFirstCountry) {
    const key = `new-country:${order.country}`
    const text = buildNewCountryTweet(order.country)

    await reserveAndPublishTweet({
      key,
      type: "new_country",
      text,
    })

    return
  }

  const groupedByCountry = await prisma.order.groupBy({
    by: ["country"],
    _sum: { amount: true },
    _count: { country: true },
  })

  const countryDistribution = groupedByCountry
    .filter((item) => item.country)
    .map((item) => ({
      country: item.country as string,
      amount: item._sum.amount ?? 0,
      donations: item._count.country,
    }))
    .sort((a, b) => b.donations - a.donations)

  const top5 = countryDistribution.slice(0, 5)

  if (top5.length >= 2) {
    let bestPair:
      | {
          leader: (typeof top5)[number]
          challenger: (typeof top5)[number]
          gap: number
        }
      | null = null

    for (let i = 0; i < top5.length - 1; i++) {
      const leader = top5[i]
      const challenger = top5[i + 1]
      const gap = leader.donations - challenger.donations

      if (!bestPair || gap < bestPair.gap) {
        bestPair = { leader, challenger, gap }
      }
    }

    if (
      bestPair &&
      bestPair.gap > 0 &&
      bestPair.gap <= 2 &&
      order.country === bestPair.challenger.country
    ) {
      const key = `battle:${bestPair.challenger.country}:${bestPair.leader.country}:${bestPair.gap}`
      const text = buildBattleTweet(
        bestPair.challenger.country,
        bestPair.leader.country,
        bestPair.gap
      )

      const published = await reserveAndPublishTweet({
        key,
        type: "battle",
        text,
      })

      if (published) return
    }
  }

  const currentRank =
    countryDistribution.findIndex((item) => item.country === order.country) + 1

  if (currentRank > 5 && countryDistribution.length >= 5) {
    const current = countryDistribution.find(
      (item) => item.country === order.country
    )
    const fifth = countryDistribution[4]

    if (current && fifth) {
      const gap = fifth.donations - current.donations + 1

      if (gap > 0 && gap <= 2) {
        const key = `top5:${order.country}:${gap}`
        const text = buildTop5Tweet(order.country, gap)

        await reserveAndPublishTweet({
          key,
          type: "top5_push",
          text,
        })
      }
    }
  }
}