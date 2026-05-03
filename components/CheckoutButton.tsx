"use client"

import { useState } from "react"

type GeoData = {
  country?: string
  latitude?: number
  longitude?: number
} | null

async function getGeo(): Promise<GeoData> {
  try {
    const res = await fetch("https://ipapi.co/json/")
    const data = await res.json()

    return {
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
    }
  } catch (error) {
    console.warn("Geo lookup failed:", error)
    return null
  }
}

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    try {
      setLoading(true)
      setError(null)

      // 🌍 1. récup geo (non bloquant)
      const geo = await getGeo()

      // ⚙️ 2. appel API checkout
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: geo?.country,
          latitude: geo?.latitude,
          longitude: geo?.longitude,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed")
      }

      // 🚀 3. redirect Stripe
      window.location.href = data.url
    } catch (err: any) {
      console.error("Checkout error:", err)
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Redirecting..." : "Join for €5"}
      </button>

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}