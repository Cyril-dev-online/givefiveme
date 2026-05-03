"use client"

import { useEffect, useState } from "react"

type CountryStat = {
  country: string | null
  _sum: {
    amount: number | null
  }
}

export default function ViralClient({
  revenue,
  goal,
  countryStats
}: {
  revenue: number
  goal: number
  countryStats: CountryStat[]
}) {
  const [displayRevenue, setDisplayRevenue] = useState(0)
  const [timeLeft, setTimeLeft] = useState(3600)

  // Animate revenue
  useEffect(() => {
    let start = 0
    const duration = 1200
    const increment = revenue / (duration / 16)

    const counter = setInterval(() => {
      start += increment
      if (start >= revenue) {
        setDisplayRevenue(revenue)
        clearInterval(counter)
      } else {
        setDisplayRevenue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(counter)
  }, [revenue])

  // Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const progress = Math.min((displayRevenue / goal) * 100, 100)

  const coordinates: Record<string, { x: number; y: number }> = {
    France: { x: 48, y: 45 },
    Germany: { x: 50, y: 42 },
    USA: { x: 30, y: 50 },
    Canada: { x: 28, y: 35 },
    UK: { x: 47, y: 40 }
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 font-[system-ui] tracking-tight">

      {/* TITLE */}
      <h1 className="text-6xl font-extrabold text-center mb-10">
        THE DIGITAL EXPERIENCE
      </h1>

      {/* COUNTDOWN */}
      <div className="text-center mb-8 text-zinc-500 tracking-wide">
        Ends in {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
      </div>

      {/* PROGRESS BAR */}
      <div className="max-w-4xl mx-auto mb-6">

        <div className="relative w-full h-8 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">

          <div
            className="relative h-8 transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #ffffff 0%, #d4d4d4 100%)"
            }}
          />

        </div>

        <p className="text-center mt-6 text-4xl font-extrabold">
          €{displayRevenue.toLocaleString()}
          <span className="text-zinc-500 text-2xl font-medium">
            {" "} / €{goal.toLocaleString()}
          </span>
        </p>

      </div>

      {/* PSYCHO MESSAGE */}
      <div className="text-center mb-12">
        <p className="text-lg text-zinc-400">
          {displayRevenue < goal * 0.25 && "You are early. The internet is waking up."}
          {displayRevenue >= goal * 0.25 && displayRevenue < goal * 0.5 && "Momentum is building. People are joining."}
          {displayRevenue >= goal * 0.5 && displayRevenue < goal * 0.75 && "This is becoming unstoppable."}
          {displayRevenue >= goal * 0.75 && displayRevenue < goal && "The world is watching now."}
          {displayRevenue >= goal && "The Internet just made history."}
        </p>
      </div>

      {/* MEGA DONATE BUTTON */}
      <div className="flex justify-center mb-20">
        <button
          onClick={async () => {
  const res = await fetch("/api/checkout", {
    method: "POST",
  })
  const data = await res.json()
  window.location.href = data.url
}}
          className="px-16 py-8 text-4xl border-4 border-white text-white rounded-3xl hover:bg-white hover:text-black transition-colors font-extrabold tracking-wider shadow-2xl"
        >
          Give me 5
        </button>
      </div>

      {/* HEATMAP */}
      <div className="max-w-6xl mx-auto">

        <h2 className="text-center text-2xl font-bold mb-8 text-zinc-300">
          LIVE GLOBAL MOMENTUM
        </h2>

        <div className="relative w-full h-[450px] bg-black rounded-3xl overflow-hidden border border-zinc-800">

          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />

          {countryStats.map((country, index) => {
            const coord = coordinates[country.country || ""]
            if (!coord) return null

            const intensity = Math.min((country._sum.amount || 0) / 5000, 1)

            return (
              <div
                key={index}
                className="absolute rounded-full blur-xl animate-pulse"
                style={{
                  left: `${coord.x}%`,
                  top: `${coord.y}%`,
                  width: `${60 + intensity * 120}px`,
                  height: `${60 + intensity * 120}px`,
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 70%)",
                  transform: "translate(-50%, -50%)"
                }}
              />
            )
          })}

        </div>
      </div>

    </main>
  )
}