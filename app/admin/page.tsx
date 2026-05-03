"use client"
import Link from "next/link"


const data = await fetch("http://localhost:3000/api/stats").then(r => r.json())
import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts"

export default function AdminDashboard() {

  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => setStats(data))

    const interval = setInterval(() => {
      fetch("/api/admin/stats")
        .then(res => res.json())
        .then(data => setStats(data))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!stats) return <p className="p-10">Loading...</p>

  const donationsData = Object.entries(stats.donationsPerDay).map(
    ([day, value]) => ({
      day,
      amount: value
    })
  )

  const visitsData = Object.entries(stats.visitsPerHour).map(
    ([hour, value]) => ({
      hour,
      visits: value
    })
  )

  return (
    <main className="p-10 bg-black text-white min-h-screen">

      <h1 className="text-3xl font-bold mb-10">
        GiveMeFive Admin
      </h1>
<div className="mt-6">
  <Link
    href="/admin/viral-moments"
    className="inline-flex rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20"
  >
    Viral moments →
  </Link>
</div>
      {/* DONATIONS CHART */}

      <div className="mb-16">

        <h2 className="text-xl mb-4">📈 Donations per Day</h2>

        <LineChart width={700} height={300} data={donationsData}>
          <CartesianGrid stroke="#333"/>
          <XAxis dataKey="day"/>
          <YAxis/>
          <Tooltip/>
          <Line type="monotone" dataKey="amount" stroke="#4f46e5"/>
        </LineChart>

      </div>

      {/* VISITS */}

      <div className="mb-16">

        <h2 className="text-xl mb-4">⏱ Visits per Hour</h2>

        <BarChart width={700} height={300} data={visitsData}>
          <CartesianGrid stroke="#333"/>
          <XAxis dataKey="hour"/>
          <YAxis/>
          <Tooltip/>
          <Bar dataKey="visits" fill="#22c55e"/>
        </BarChart>

      </div>

      {/* COUNTRIES */}

      <div className="mb-16">

        <h2 className="text-xl mb-4">🌍 Donor Countries</h2>

        <div className="space-y-2">

          {Object.entries(stats.countries).map(
            ([country, count]: any, i) => (

              <div
                key={i}
                className="flex justify-between bg-zinc-900 p-4 rounded"
              >
                <span>{country}</span>
                <span>{count}</span>

              </div>

            )
          )}

        </div>

      </div>

      {/* LIVE FEED */}

      <div>

        <h2 className="text-xl mb-4">🔴 Latest Donations</h2>

        <div className="space-y-2">

          {stats.latestOrders.map((o: any) => (

            <div
              key={o.id}
              className="bg-zinc-900 p-4 rounded flex justify-between"
            >
              <span>{o.country || "Unknown"}</span>
              <span>€{o.amount}</span>

            </div>

          ))}

        </div>

      </div>

    </main>
  )
}