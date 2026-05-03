import { prisma } from "@/lib/prisma"

export async function GET() {
  const donations = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50, // les 50 derniers dons
  })

  return new Response(JSON.stringify(donations), {
    headers: { "Content-Type": "application/json" },
  })
}