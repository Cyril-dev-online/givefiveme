import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { processViralMoment } from "@/lib/process-viral-moment"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const country = searchParams.get("country") || "spain"

  const order = await prisma.order.create({
    data: {
      country,
      amount: 500,
      stripeId: `fake_${crypto.randomUUID()}`,
    },
  })

  const countryRank = Number(searchParams.get("rank") || 4)
  const opponent = searchParams.get("opponent") || "italy"
  const gap = Number(searchParams.get("gap") || 1)

  const impactType = "BATTLE" as const

  const impactData = {
    opponent,
    gap,
  }

  await processViralMoment({
    orderId: order.id,
    country,
    countryRank,
    impactType,
    impactData,
  })

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    country,
    countryRank,
    impactType,
    impactData,
  })
}