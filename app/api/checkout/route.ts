import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"

const stripeKey = process.env.STRIPE_SECRET_KEY

if (!stripeKey) {
  throw new Error("Missing STRIPE_SECRET_KEY")
}

const stripe = new Stripe(stripeKey)

function getBaseUrl(req: Request) {
  const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL

  if (envBaseUrl) {
    return envBaseUrl.replace(/\/$/, "")
  }

  return new URL(req.url).origin
}

function normalizeCountry(value: string | null | undefined) {
  if (!value) return "Unknown"
  const trimmed = value.trim()
  return trimmed || "Unknown"
}

function normalizeCoordinate(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const headerStore = await headers()

    const headerCountry =
      headerStore.get("x-vercel-ip-country") ||
      headerStore.get("cf-ipcountry") ||
      headerStore.get("x-country") ||
      headerStore.get("x-appengine-country")

    const country =
      normalizeCountry(headerCountry) !== "Unknown"
        ? normalizeCountry(headerCountry)
        : normalizeCountry(body?.country)

    const latitude = normalizeCoordinate(body?.latitude ?? body?.lat)
    const longitude = normalizeCoordinate(body?.longitude ?? body?.lon)

    const baseUrl = getBaseUrl(req)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "GiveFive participation",
              description: "Join the live global internet experiment.",
            },
            unit_amount: 500,
          },
          quantity: 1,
        },
      ],
      metadata: {
        country,
        lat: latitude !== null ? String(latitude) : "",
        lon: longitude !== null ? String(longitude) : "",
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
      billing_address_collection: "auto",
    })

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe session URL is missing" },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout session",
      },
      { status: 500 }
    )
  }
}