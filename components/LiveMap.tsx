"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Map, { Marker, Popup, type MapRef, NavigationControl } from "react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"

type Donation = {
  id: string
  amount: number
  country: string | null
  latitude: number | null
  longitude: number | null
  createdAt: string
  isFirstCountry?: boolean
  countryCount?: number
  totalAmount?: number
  totalDonations?: number
}

type LiveMapProps = {
  initialDonations: Donation[]
  initialTotalAmount: number
  initialTotalDonations: number
  initialCountryCount: number
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

function formatRelative(createdAt: string) {
  const now = Date.now()
  const then = new Date(createdAt).getTime()
  const diff = Math.max(0, Math.floor((now - then) / 1000))

  if (diff < 10) return "just now"
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function LiveMap({
  initialDonations,
  initialTotalAmount,
  initialTotalDonations,
  initialCountryCount,
}: LiveMapProps) {
  const mapRef = useRef<MapRef | null>(null)

  const [donations, setDonations] = useState<Donation[]>(initialDonations)
  const [totalAmount, setTotalAmount] = useState(initialTotalAmount)
  const [totalDonations, setTotalDonations] = useState(initialTotalDonations)
  const [countryCount, setCountryCount] = useState(initialCountryCount)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [latestDonationId, setLatestDonationId] = useState<string | null>(null)

  const latestTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const source = new EventSource("/api/live")

    const onDonation = (event: Event) => {
      const donation = JSON.parse((event as MessageEvent).data) as Donation

      if (
        donation.latitude == null ||
        donation.longitude == null
      ) {
        return
      }

      setDonations((prev) => {
        if (prev.some((item) => item.id === donation.id)) return prev
        return [donation, ...prev].slice(0, 400)
      })

      setTotalAmount((prev) =>
        typeof donation.totalAmount === "number" ? donation.totalAmount : prev + donation.amount
      )

      setTotalDonations((prev) =>
        typeof donation.totalDonations === "number" ? donation.totalDonations : prev + 1
      )

      setCountryCount((prev) =>
        typeof donation.countryCount === "number"
          ? donation.countryCount
          : donation.isFirstCountry
            ? prev + 1
            : prev
      )

      setLatestDonationId(donation.id)

      if (latestTimeoutRef.current) clearTimeout(latestTimeoutRef.current)
      latestTimeoutRef.current = setTimeout(() => {
        setLatestDonationId(null)
      }, 3500)

      mapRef.current?.flyTo({
        center: [donation.longitude, donation.latitude],
        zoom: 2.6,
        duration: 2200,
        essential: true,
      })
    }

    source.addEventListener("donation", onDonation)

    source.onerror = (err) => {
      console.error("Live map SSE error:", err)
    }

    return () => {
      source.removeEventListener("donation", onDonation)
      source.close()

      if (latestTimeoutRef.current) clearTimeout(latestTimeoutRef.current)
    }
  }, [])

  const validDonations = useMemo(
    () =>
      donations.filter(
        (donation) =>
          donation.latitude != null && donation.longitude != null
      ),
    [donations]
  )

  const latestFive = useMemo(() => validDonations.slice(0, 5), [validDonations])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-black p-8 text-center text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8">
          <p className="text-lg font-semibold">Map unavailable</p>
          <p className="mt-2 text-sm text-white/60">
            Missing NEXT_PUBLIC_MAPBOX_TOKEN
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="gmf-map relative min-h-[70vh] bg-black">
      <Map
  ref={mapRef}
  mapboxAccessToken={MAPBOX_TOKEN}
  initialViewState={{
    longitude: 8,
    latitude: 20,
    zoom: 1.25,
  }}
  mapStyle="mapbox://styles/mapbox/dark-v11"
  projection={{ name: "globe" }}
  fog={{
    color: "rgb(8, 8, 10)",
    "high-color": "rgb(18, 18, 22)",
    "horizon-blend": 0.08,
    "space-color": "rgb(3, 3, 4)",
    "star-intensity": 0.0,
  }}
  attributionControl={false}
  style={{ width: "100%", height: "70vh" }}
>
        <NavigationControl position="top-right" showCompass={false} />

        {validDonations.map((donation) => {
          const isLatest = donation.id === latestDonationId
          const isFirstCountry = donation.isFirstCountry

          return (
            <Marker
              key={donation.id}
              longitude={donation.longitude as number}
              latitude={donation.latitude as number}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setSelectedDonation(donation)
              }}
            >
              <button
                className="relative flex h-4 w-4 items-center justify-center rounded-full outline-none"
                aria-label={`Donation from ${donation.country || "Unknown"}`}
                type="button"
              >
                {isLatest && (
                  <span className="absolute h-10 w-10 animate-ping rounded-full bg-emerald-400/25" />
                )}

                <span
                  className={`absolute rounded-full ${
                    isFirstCountry
                      ? "h-6 w-6 bg-emerald-400/20"
                      : "h-5 w-5 bg-white/15"
                  }`}
                />

                <span
                  className={`relative rounded-full border ${
                    isFirstCountry
                      ? "h-3.5 w-3.5 border-emerald-300 bg-emerald-400"
                      : "h-3 w-3 border-white/60 bg-white"
                  } ${isLatest ? "shadow-[0_0_20px_rgba(74,222,128,0.55)]" : ""}`}
                />
              </button>
            </Marker>
          )
        })}

        {selectedDonation &&
          selectedDonation.latitude != null &&
          selectedDonation.longitude != null && (
            <Popup
              longitude={selectedDonation.longitude}
              latitude={selectedDonation.latitude}
              anchor="top"
              closeButton={false}
              closeOnClick={false}
              offset={18}
              onClose={() => setSelectedDonation(null)}
              className="[&_.mapboxgl-popup-content]:rounded-2xl [&_.mapboxgl-popup-content]:border [&_.mapboxgl-popup-content]:border-white/10 [&_.mapboxgl-popup-content]:bg-black [&_.mapboxgl-popup-content]:p-0 [&_.mapboxgl-popup-tip]:border-t-black"
            >
              <div className="min-w-[220px] rounded-2xl bg-black p-4 text-white">
                <p className="text-sm uppercase tracking-wide text-white/45">
                  Live donation
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {selectedDonation.country || "Unknown"}
                </p>
                <p className="mt-1 text-sm text-white/55">
                  €{selectedDonation.amount.toLocaleString("en-US")} ·{" "}
                  {formatRelative(selectedDonation.createdAt)}
                </p>

                {selectedDonation.isFirstCountry && (
                  <p className="mt-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                    New country
                  </p>
                )}
              </div>
            </Popup>
          )}
      </Map>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/70 px-4 py-3 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
            Raised
          </p>
          <p className="mt-1 text-xl font-semibold text-white">
            €{totalAmount.toLocaleString("en-US")}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/70 px-4 py-3 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
            People
          </p>
          <p className="mt-1 text-xl font-semibold text-white">
            {totalDonations.toLocaleString("en-US")}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-black/70 px-4 py-3 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/70">
            Countries
          </p>
          <p className="mt-1 text-xl font-semibold text-white">
            {countryCount.toLocaleString("en-US")}
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-20 hidden w-[320px] rounded-3xl border border-white/10 bg-black/75 p-4 backdrop-blur lg:block">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
              Live feed
            </p>
            <p className="mt-1 text-base font-semibold text-white">
              Latest map activity
            </p>
          </div>

          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-300">
            LIVE
          </span>
        </div>

        <div className="space-y-2">
          {latestFive.length > 0 ? (
            latestFive.map((donation) => (
              <button
                key={donation.id}
                type="button"
                onClick={() => {
                  setSelectedDonation(donation)
                  if (
                    donation.longitude != null &&
                    donation.latitude != null
                  ) {
                    mapRef.current?.flyTo({
                      center: [donation.longitude, donation.latitude],
                      zoom: 2.8,
                      duration: 1800,
                      essential: true,
                    })
                  }
                }}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition ${
                  donation.id === latestDonationId
                    ? "border-emerald-400/30 bg-emerald-400/10"
                    : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <div>
                  <p className="font-medium text-white">
                    {donation.isFirstCountry ? "🎉 " : ""}
                    {donation.country || "Unknown"}
                  </p>
                  <p className="text-xs text-white/45">
                    {formatRelative(donation.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-white">
                    €{donation.amount}
                  </p>
                  {donation.isFirstCountry && (
                    <p className="text-xs text-emerald-300">New country</p>
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-white/50">No live donations yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
