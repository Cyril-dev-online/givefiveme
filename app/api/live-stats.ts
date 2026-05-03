import { prisma } from "@/lib/prisma"

export async function GET() {
  const donations = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  })

  const byCountry: Record<string, number> = {}
  donations.forEach(d => {
    const c = d.country || "Unknown"
    byCountry[c] = (byCountry[c] || 0) + 1
  })

  return new Response(
    JSON.stringify({
      total: donations.length,
      donations,
      byCountry
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
}