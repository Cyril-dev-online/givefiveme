import { prisma } from "@/lib/prisma"
import { detectViralMoment } from "@/lib/viral-moments"
import { buildTikTokScript } from "@/lib/tiktok-scripts"
import { notifyViralMoment } from "@/lib/notify-viral-moment"

export async function processViralMoment(args: {
  orderId: string
  country: string
  countryRank: number | null
  impactType: "NEW_COUNTRY" | "TOP5" | "BATTLE" | "MOVE"
  impactData: Record<string, unknown> | null | undefined
}) {
  const moment = detectViralMoment(args)

  if (!moment) return

  const recentDuplicate = await prisma.viralMoment.findFirst({
    where: {
      dedupeKey: moment.dedupeKey,
      createdAt: {
        gte: new Date(Date.now() - 1000 * 60 * 20),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (recentDuplicate) {
    console.log("[viral] duplicate suppressed", {
      dedupeKey: moment.dedupeKey,
      existingId: recentDuplicate.id,
    })
    return
  }

  const saved = await prisma.viralMoment.create({
    data: {
      orderId: moment.orderId,
      type: moment.type,
      score: moment.score,
      country: moment.country,
      opponent: moment.opponent ?? null,
      gap: moment.gap ?? null,
      rank: moment.rank ?? null,
      reason: moment.reason,
      dedupeKey: moment.dedupeKey,
      payload: moment.payload,
    },
  })

  if (moment.score < 60) {
    console.log("[viral] below notify threshold", {
      id: saved.id,
      score: moment.score,
    })
    return
  }

  const script = buildTikTokScript(moment)

  await notifyViralMoment(moment, script)

  await prisma.viralMoment.update({
    where: { id: saved.id },
    data: {
      notifiedAt: new Date(),
    },
  })

  console.log("[viral] notified", {
    id: saved.id,
    type: moment.type,
    score: moment.score,
  })
}