import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function isAuthorized(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret) {
    return false
  }

  const authHeader = req.headers.get("authorization")
  const querySecret = req.nextUrl.searchParams.get("secret")

  if (authHeader === `Bearer ${adminSecret}`) {
    return true
  }

  if (querySecret === adminSecret) {
    return true
  }

  return false
}

function parseLimit(value: string | null) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) return 25

  return Math.min(Math.max(parsed, 1), 100)
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const type = req.nextUrl.searchParams.get("type")
    const notified = req.nextUrl.searchParams.get("notified")
    const limit = parseLimit(req.nextUrl.searchParams.get("limit"))

    const where: {
      type?: string
      notifiedAt?: null | { not: null }
    } = {}

    if (type) {
      where.type = type
    }

    if (notified === "true") {
      where.notifiedAt = {
        not: null,
      }
    }

    if (notified === "false") {
      where.notifiedAt = null
    }

    const moments = await prisma.viralMoment.findMany({
      where,
      orderBy: [
        { score: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    })

    return NextResponse.json({
      count: moments.length,
      moments,
    })
  } catch (error) {
    console.error("[viral-moments] GET failed", error)

    return NextResponse.json(
      { error: "Failed to load viral moments" },
      { status: 500 }
    )
  }
}