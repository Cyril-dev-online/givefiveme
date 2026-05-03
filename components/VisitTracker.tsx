"use client"

import { useEffect } from "react"

export default function VisitTracker() {
  useEffect(() => {
    const alreadyTracked = sessionStorage.getItem("visit-tracked")
    if (alreadyTracked) return

    async function trackVisit() {
      try {
        const geoRes = await fetch("https://ipapi.co/json/")

        if (!geoRes.ok) {
          throw new Error(`Geo request failed: ${geoRes.status}`)
        }

        const data = await geoRes.json()

        await fetch("/api/track-visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: data.country_name || "Unknown",
            city: data.city || null,
            latitude:
              typeof data.latitude === "number" ? data.latitude : null,
            longitude:
              typeof data.longitude === "number" ? data.longitude : null,
          }),
        })
      } catch (error) {
        console.error("VisitTracker error:", error)

        await fetch("/api/track-visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: "Unknown",
            city: null,
            latitude: null,
            longitude: null,
          }),
        })
      }

      sessionStorage.setItem("visit-tracked", "true")
    }

    trackVisit()
  }, [])

  return null
}