import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)

  const visits = await prisma.visit.findMany({
    where: {
      createdAt: {
        gte: last30Days
      }
    },
    select: {
      createdAt: true
    }
  })

  const daily: Record<string, number> = {}

  visits.forEach(visit => {
    const day = visit.createdAt.toISOString().split("T")[0]
    daily[day] = (daily[day] || 0) + 1
  })

  const formatted = Object.entries(daily)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, total]) => ({
      day,
      total
    }))

  return NextResponse.json(formatted)
}