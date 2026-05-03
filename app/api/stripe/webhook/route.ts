import Stripe from "stripe"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { emitNewDonation } from "@/lib/live-events"
import { maybeTriggerTweetForOrder } from "@/lib/auto-tweets"
import { processViralMoment } from "@/lib/process-viral-moment"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

type ImpactType = "NEW_COUNTRY" | "TOP5" | "BATTLE" | "MOVE"

type CountryStanding = {
  country: string
  donations: number
}

function getBattleForCountry(
  standings: CountryStanding[],
  country: string
): {
  opponent: string
  gap: number
  ahead: boolean
} | null {
  const index = standings.findIndex((item) => item.country === country)
  if (index === -1) return null

  const current = standings[index]
  const candidates: Array<{ opponent: string; gap: number; ahead: boolean }> = []

  const above = standings[index - 1]
  const below = standings[index + 1]

  if (above) {
    candidates.push({
      opponent: above.country,
      gap: Math.abs(above.donations - current.donations),
      ahead: false,
    })
  }

  if (below) {
    candidates.push({
      opponent: below.country,
      gap: Math.abs(current.donations - below.donations),
      ahead: true,
    })
  }

  if (candidates.length === 0) return null

  candidates.sort((a, b) => a.gap - b.gap)
  return candidates[0]
}

function normalizeFinalCountry(value: string) {
  return value.trim().toLowerCase()
}

function countryCodeToName(code: string | null | undefined) {
  if (!code) return null

  try {
    const regionNames = new Intl.DisplayNames(["en"], {
      type: "region",
    })

    const name = regionNames.of(code.toUpperCase())
    return name === "United States" ? "USA" : name || code
  } catch {
    return code
  }
}

function anonymizeCoord(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null

  // ~10–20km precision
  return Math.round(value * 10) / 10
}

function normalizeCountry(value: string | null | undefined) {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed || null
}

export async function POST(req: Request) {
  console.log("[webhook] route hit")
  console.log("[webhook] env", {
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
  })

  const body = await req.text()
  const signature = (await headers()).get("stripe-signature")

  if (!signature) {
    console.error("[webhook] missing stripe-signature header")
    return new Response("Missing stripe signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("[webhook] signature error:", err)
    return new Response("Invalid signature", { status: 400 })
  }

  console.log("[webhook] event received", {
    type: event.type,
    id: event.id,
  })

  try {
    if (event.type !== "checkout.session.completed") {
      return new Response("OK", { status: 200 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    const stripeId = session.id
    const amount = (session.amount_total ?? 0) / 100

    const metadataCountryRaw = normalizeCountry(session.metadata?.country)
    const billingCountryRaw = normalizeCountry(
      session.customer_details?.address?.country
    )

    const metadataCountry = countryCodeToName(metadataCountryRaw)
    const billingCountry = countryCodeToName(billingCountryRaw)

    const countryRaw = metadataCountry || billingCountry || "Unknown"
    const country = normalizeFinalCountry(countryRaw)

    const rawLatitude = session.metadata?.lat
    const rawLongitude = session.metadata?.lon

    const latitude = anonymizeCoord(
      rawLatitude ? Number(rawLatitude) : null
    )

    const longitude = anonymizeCoord(
      rawLongitude ? Number(rawLongitude) : null
    )

    console.log("[webhook] country resolution", {
      stripeId,
      metadataCountry,
      billingCountry,
      finalCountry: country,
    })

    console.log("[webhook] processing checkout.session.completed", {
      stripeId,
      amount,
      country,
      latitude,
      longitude,
    })

    const existing = await prisma.order.findUnique({
      where: { stripeId },
    })

    if (existing) {
      console.log("[webhook] duplicate ignored", {
        stripeId,
        orderId: existing.id,
      })
      return new Response("OK", { status: 200 })
    }

    const existingCountryCount = await prisma.order.count({
      where: { country },
    })

    const isFirstCountry = existingCountryCount === 0

    const createdOrder = await prisma.order.create({
      data: {
        amount,
        country,
        latitude,
        longitude,
        stripeId,
        isFirstCountry,
      },
    })

    const groupedByCountry = await prisma.order.groupBy({
      by: ["country"],
      _count: { country: true },
      orderBy: {
        _count: {
          country: "desc",
        },
      },
    })

    const standings: CountryStanding[] = groupedByCountry
      .filter((item) => item.country)
      .map((item) => ({
        country: item.country as string,
        donations: item._count.country,
      }))
      .sort(
        (a, b) =>
          b.donations - a.donations || a.country.localeCompare(b.country)
      )

    const rankIndex = standings.findIndex((item) => item.country === country)
    const countryRank = rankIndex >= 0 ? rankIndex + 1 : null

    const top5 = standings.slice(0, 5)
    const isTop5 = !!countryRank && countryRank <= 5

    const battle = getBattleForCountry(standings, country)

    let impactType: ImpactType = "MOVE"
    let impactData: Record<string, unknown> = {
      country,
      countryRank,
    }

    if (isFirstCountry) {
      impactType = "NEW_COUNTRY"
      impactData = {
        country,
        countryRank,
      }
    } else if (isTop5) {
      const fifth = top5[4]
      const battleNearTop = getBattleForCountry(top5, country)

      if (battleNearTop && battleNearTop.gap <= 2) {
        impactType = "BATTLE"
        impactData = {
          country,
          countryRank,
          opponent: battleNearTop.opponent,
          gap: battleNearTop.gap,
          ahead: battleNearTop.ahead,
        }
      } else {
        impactType = "TOP5"
        impactData = {
          country,
          countryRank,
          target: fifth?.country ?? null,
        }
      }
    } else if (battle && battle.gap <= 2) {
      impactType = "BATTLE"
      impactData = {
        country,
        countryRank,
        opponent: battle.opponent,
        gap: battle.gap,
        ahead: battle.ahead,
      }
    }

    const order = await prisma.order.update({
      where: { id: createdOrder.id },
      data: {
        impactType,
        impactData,
      },
    })

import { processViralMoment } from "@/lib/process-viral-moment"

try {
  await processViralMoment({
    orderId: order.id,
    country,
    countryRank,
    impactType,
    impactData,
  })
} catch (viralError) {
  console.error("[webhook] viral moment error:", viralError)
}

const viralMoment = detectViralMoment({
  order,
  standings,
  countryRank,
  impactType,
  impactData,
})

if (viralMoment && viralMoment.score >= 60) {
  const script = buildTikTokScript(viralMoment)
  await notifyViralMoment(viralMoment, script)
}

    console.log("[webhook] order created", {
      orderId: order.id,
      stripeId,
      impactType,
      country,
      countryRank,
    })

    const totalAggregate = await prisma.order.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    })

    emitNewDonation({
      id: order.id,
      amount: order.amount,
      country: order.country,
      latitude: order.latitude,
      longitude: order.longitude,
      createdAt: order.createdAt.toISOString(),
      isFirstCountry: order.isFirstCountry,
      totalAmount: totalAggregate._sum.amount ?? order.amount,
      totalDonations: totalAggregate._count.id ?? 1,
      countryCount: standings.length,
    })

    try {
      await maybeTriggerTweetForOrder(order)
    } catch (tweetError) {
      console.error("[webhook] auto-tweet error:", tweetError)
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("[webhook] processing error:", error)
    return new Response("Webhook handler error", { status: 500 })
  }
}