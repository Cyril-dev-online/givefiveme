import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const orders = await prisma.order.findMany({
    select: {
      amount: true,
      createdAt: true
    }
  })

  const monthly: Record<string, number> = {}

  orders.forEach(order => {
    const date = new Date(order.createdAt)
    const month = `${date.getFullYear()}-${date.getMonth() + 1}`

    if (!monthly[month]) {
      monthly[month] = 0
    }

    monthly[month] += order.amount
  })

  const formatted = Object.entries(monthly).map(([month, total]) => ({
    month,
    total
  }))

  return NextResponse.json(formatted)
}