import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return NextResponse.json({
    amount: session.amount_total,
    currency: session.currency,
  })
}