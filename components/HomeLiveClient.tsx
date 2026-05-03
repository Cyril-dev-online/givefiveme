"use client"

import { useState } from "react"
import { LiveToasts } from "@/components/LiveToasts"

type Stats = {
  totalAmount: number
  totalDonations: number
  countryCount: number
  goalAmount: number
  progress: number
  topCountries: {
    country: string
    totalAmount: number
    donations: number
  }[]
  latest: {
    id: string
    amount: number
    country: string
    createdAt: string
    latitude: number | null
    longitude: number | null
  }[]
}

export function HomeLiveClient({ initialStats }: { initialStats: Stats }) {
  const [stats, setStats] = useState(initialStats)

  return (
    <>
      <LiveToasts
        onDonation={(payload) => {
          setStats((prev) => {
            const existingCountry = prev.topCountries.find(
              (c) => c.country === payload.country
            )

            let nextCountries
            if (existingCountry) {
              nextCountries = prev.topCountries
                .map((c) =>
                  c.country === payload.country
                    ? {
                        ...c,
                        totalAmount: c.totalAmount + payload.amount,
                        donations: c.donations + 1,
                      }
                    : c
                )
                .sort((a, b) => b.totalAmount - a.totalAmount)
            } else {
              nextCountries = [
                {
                  country: payload.country,
                  totalAmount: payload.amount,
                  donations: 1,
                },
                ...prev.topCountries,
              ].sort((a, b) => b.totalAmount - a.totalAmount)
            }

            return {
              ...prev,
              totalAmount: payload.totalAmount ?? prev.totalAmount + payload.amount,
              totalDonations:
                payload.totalDonations ?? prev.totalDonations + 1,
              countryCount: payload.countryCount ?? prev.countryCount,
              progress: Math.min(
                (payload.totalAmount ?? prev.totalAmount + payload.amount) /
                  prev.goalAmount,
                1
              ),
              latest: [
                {
                  id: payload.id,
                  amount: payload.amount,
                  country: payload.country,
                  createdAt: payload.createdAt,
                  latitude: payload.latitude,
                  longitude: payload.longitude,
                },
                ...prev.latest,
              ].slice(0, 10),
              topCountries: nextCountries,
            }
          })
        }}
      />

      <section className="rounded-3xl border p-6">
        <h2 className="text-xl font-semibold">Latest Participants</h2>

        <div className="mt-4 space-y-3">
          {stats.latest.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3"
            >
              <div>
                <div className="font-medium">{item.country}</div>
                <div className="text-sm text-zinc-500">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="font-semibold">+€{item.amount}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}