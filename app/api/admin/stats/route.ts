import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" }
  })

  const visits = await prisma.visit.findMany()

  // DONS PAR JOUR
  const donationsPerDay: Record<string, number> = {}

  orders.forEach(order => {
    const day = new Date(order.createdAt).toLocaleDateString()
    donationsPerDay[day] = (donationsPerDay[day] || 0) + order.amount
  })

  // VISITES PAR HEURE
  const visitsPerHour: Record<string, number> = {}

  visits.forEach(v => {
    const hour = new Date(v.createdAt).getHours()
    visitsPerHour[hour] = (visitsPerHour[hour] || 0) + 1
  })

  // PAYS DONATEURS
  const countries: Record<string, number> = {}

  orders.forEach(order => {
    const c = order.country || "Unknown"
    countries[c] = (countries[c] || 0) + 1
  })

  return NextResponse.json({
    donationsPerDay,
    visitsPerHour,
    countries,
    latestOrders: orders.slice(0, 10)
  })
}