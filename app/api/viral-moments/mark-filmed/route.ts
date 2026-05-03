import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function isAuthorized(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) return false

  const authHeader = req.headers.get("authorization")
  const querySecret = req.nextUrl.searchParams.get("secret")

  return authHeader === `Bearer ${adminSecret}` || querySecret === adminSecret
}

async function markFilmed(id: string) {
  return prisma.viralMoment.update({
    where: { id },
    data: {
      filmedAt: new Date(),
    },
  })
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = req.nextUrl.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    await markFilmed(id)

    return NextResponse.redirect(new URL("/admin/viral-moments", req.url))
  } catch (error) {
    console.error("[mark-filmed] GET failed", error)

    return NextResponse.json(
      { error: "Failed to mark as filmed" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const moment = await markFilmed(id)

    return NextResponse.json({
      ok: true,
      moment,
    })
  } catch (error) {
    console.error("[mark-filmed] POST failed", error)

    return NextResponse.json(
      { error: "Failed to mark as filmed" },
      { status: 500 }
    )
  }
}