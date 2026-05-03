import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const donations = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        amount: true,
        country: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
    })

    return NextResponse.json(donations)
  } catch (error) {
    console.error("/api/visits error:", error)
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    )
  }
}