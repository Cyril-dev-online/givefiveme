"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

type CountryStat = {
  country: string
  amount: number
  donations: number
}

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

type StatsResponse = {
  totalAmount: number
  totalDonations: number
  countryCount: number
  topCountries: CountryStat[]
  latest: Donation[]
}

const GOAL = 1_000_000

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

function buildTweetText(
  totalAmount: number,
  totalDonations: number,
  countryCount: number,
  shareUrl: string
) {
  return `I just joined this weird internet experiment.

Give €5.
No reward.
Just to see how far it spreads.

Already:
€${totalAmount.toLocaleString("en-US")} raised
${totalDonations.toLocaleString("en-US")} people
${countryCount.toLocaleString("en-US")} countries

🌍 ${shareUrl}`
}

export default function HomePage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [liveDonations, setLiveDonations] = useState<Donation[]>([])
  const [newLiveDonationId, setNewLiveDonationId] = useState<string | null>(null)
  const [toastDonation, setToastDonation] = useState<Donation | null>(null)
  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [flashTotal, setFlashTotal] = useState(false)
  const [lastUnlockedCountry, setLastUnlockedCountry] =
    useState<Donation | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const animatedTotalRef = useRef(0)
  const hasInitializedAnimatedTotalRef = useRef(false)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch stats")

        const data: StatsResponse = await res.json()
        setStats(data)
        setLiveDonations(data.latest.slice(0, 6))

        const firstNewCountry = data.latest.find((item) => item.isFirstCountry)
        if (firstNewCountry) setLastUnlockedCountry(firstNewCountry)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  useEffect(() => {
    const target = stats?.totalAmount ?? 0

    if (!hasInitializedAnimatedTotalRef.current) {
      hasInitializedAnimatedTotalRef.current = true
      animatedTotalRef.current = target
      setAnimatedTotal(target)
      return
    }

    const startValue = animatedTotalRef.current
    if (target === startValue) return

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    const duration = 900
    const startTime = performance.now()
    const diff = target - startValue

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const nextValue = Math.floor(startValue + diff * eased)

      animatedTotalRef.current = nextValue
      setAnimatedTotal(nextValue)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        animatedTotalRef.current = target
        setAnimatedTotal(target)
        animationFrameRef.current = null
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [stats?.totalAmount])

  useEffect(() => {
    const source = new EventSource("/api/live")

    const onDonation = (event: Event) => {
      const donation = JSON.parse((event as MessageEvent).data) as Donation

      setLiveDonations((prev) => {
        if (prev.some((d) => d.id === donation.id)) return prev
        return [donation, ...prev].slice(0, 6)
      })

      setStats((prev) => {
        if (!prev) return prev

        const updatedLatest = [
          donation,
          ...prev.latest.filter((d) => d.id !== donation.id),
        ].slice(0, 10)

        const nextTopCountriesMap = new Map<
          string,
          { amount: number; donations: number }
        >()

        prev.topCountries.forEach((item) => {
          nextTopCountriesMap.set(item.country, {
            amount: item.amount,
            donations: item.donations,
          })
        })

        const country = donation.country || "Unknown"
        const existing = nextTopCountriesMap.get(country)

        nextTopCountriesMap.set(country, {
          amount: (existing?.amount ?? 0) + donation.amount,
          donations: (existing?.donations ?? 0) + 1,
        })

        const topCountries = Array.from(nextTopCountriesMap.entries())
          .map(([countryName, value]) => ({
            country: countryName,
            amount: value.amount,
            donations: value.donations,
          }))
          .sort((a, b) => b.donations - a.donations)
          .slice(0, 5)

        return {
          ...prev,
          totalAmount:
            typeof donation.totalAmount === "number"
              ? donation.totalAmount
              : prev.totalAmount + donation.amount,
          totalDonations:
            typeof donation.totalDonations === "number"
              ? donation.totalDonations
              : prev.totalDonations + 1,
          countryCount:
            typeof donation.countryCount === "number"
              ? donation.countryCount
              : donation.isFirstCountry
                ? prev.countryCount + 1
                : prev.countryCount,
          latest: updatedLatest,
          topCountries,
        }
      })

      if (donation.isFirstCountry) {
        setLastUnlockedCountry(donation)
      }

      setNewLiveDonationId(donation.id)
      setToastDonation(donation)
      setFlashTotal(true)

      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
      highlightTimeoutRef.current = setTimeout(() => {
        setNewLiveDonationId(null)
      }, 3000)

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = setTimeout(() => {
        setToastDonation(null)
      }, 4000)

      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
      flashTimeoutRef.current = setTimeout(() => {
        setFlashTotal(false)
      }, 600)
    }

    source.addEventListener("donation", onDonation)

    source.onerror = (err) => {
      console.error("Home SSE error:", err)
    }

    return () => {
      source.removeEventListener("donation", onDonation)
      source.close()

      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
    }
  }, [])

  const totalAmount = stats?.totalAmount ?? 0
  const totalDonations = stats?.totalDonations ?? 0
  const countryCount = stats?.countryCount ?? 0
  const topCountries = stats?.topCountries ?? []

  const progress = useMemo(() => {
    if (!totalAmount) return 0
    return Math.min((totalAmount / GOAL) * 100, 100)
  }, [totalAmount])

  const shareUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || ""

  const tweetText = useMemo(
    () => buildTweetText(totalAmount, totalDonations, countryCount, shareUrl),
    [totalAmount, totalDonations, countryCount, shareUrl]
  )

  async function handleDonate() {
    try {
      setIsCheckoutLoading(true)

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to create checkout session")
      }

      const data = await res.json()

      if (data?.url) {
        window.location.href = data.url
        return
      }

      throw new Error("Missing checkout URL")
    } catch (error) {
      console.error(error)
      alert(
        error instanceof Error
          ? error.message
          : "Unable to start checkout."
      )
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  function handleShare() {
    const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}`

    window.open(twitterIntent, "_blank", "noopener,noreferrer")
  }

  async function handleCopyShare() {
    try {
      await navigator.clipboard.writeText(tweetText)
      setShareCopied(true)

      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
      copiedTimeoutRef.current = setTimeout(() => {
        setShareCopied(false)
      }, 2000)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  return (
    <main className="min-h-screen bg-black pb-24 text-white md:pb-0">
      <AnimatePresence mode="wait">
        {liveDonations[0] && (
          <motion.div
            key={liveDonations[0].id}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed left-0 right-0 top-0 z-50 border-b border-emerald-400/20 bg-emerald-400 px-4 py-2 text-center text-sm font-semibold text-black"
          >
            {liveDonations[0].isFirstCountry ? (
              <>🌍 New country unlocked: {liveDonations[0].country || "Unknown"} (+€5)</>
            ) : (
              <>🟢 Someone from {liveDonations[0].country || "somewhere"} just joined (+€5)</>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative mx-auto flex max-w-6xl flex-col items-center overflow-hidden px-6 pb-14 pt-28 text-center sm:pt-32">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-1/2 top-32 h-64 w-[30rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75"
        >
          🚀 Live public internet experiment
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative z-10 max-w-5xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
        >
          Give €5. Watch the internet move.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`relative z-10 mt-8 text-2xl font-semibold tracking-tight transition-colors duration-500 sm:text-3xl ${
            flashTotal ? "text-emerald-400" : "text-white"
          }`}
        >
          €{animatedTotal.toLocaleString("en-US")} raised by{" "}
          {loading ? "..." : totalDonations.toLocaleString("en-US")} people in{" "}
          {loading ? "..." : countryCount.toLocaleString("en-US")} countries.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative z-10 mt-4 max-w-2xl text-lg text-white/60 sm:text-xl"
        >
          No reward. No promise. Just a public experiment, visible in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 mt-10 flex flex-col items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDonate}
            disabled={isCheckoutLoading}
            className="rounded-2xl bg-white px-10 py-5 text-xl font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCheckoutLoading ? "Redirecting..." : "Give €5"}
          </motion.button>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <Link
              href="/live"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              🌍 Live map
            </Link>

            <Link
              href="/stats"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              📊 Stats
            </Link>
          </div>
        </motion.div>

<p className="mt-6 text-xs text-white/40 text-center max-w-md mx-auto leading-relaxed">
  This experiment uses approximate location based on your IP.{" "}
  <a
    href="/privacy"
    className="underline underline-offset-2 hover:text-white transition"
  >
    Privacy
  </a>
</p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25 }}
          className="relative z-10 mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs uppercase tracking-wide text-white/40">People</p>
            <p className="mt-2 text-2xl font-bold">
              {loading ? "..." : totalDonations.toLocaleString("en-US")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Countries
            </p>
            <p className="mt-2 text-2xl font-bold">
              {loading ? "..." : countryCount.toLocaleString("en-US")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Fixed entry
            </p>
            <p className="mt-2 text-2xl font-bold">€5</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10 mt-10 w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur"
        >
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/45">
                Global progress
              </p>
              <motion.p
                key={animatedTotal}
                initial={{ opacity: 0.7, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`mt-2 text-3xl font-bold transition-colors duration-500 sm:text-4xl ${
                  flashTotal ? "text-emerald-400" : "text-white"
                }`}
              >
                €{animatedTotal.toLocaleString("en-US")}
              </motion.p>
            </div>

            <div className="text-right">
              <p className="text-sm text-white/45">Goal</p>
              <p className="text-lg font-semibold">€{GOAL.toLocaleString("en-US")}</p>
            </div>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-white/55">
            <span>{progress.toFixed(2)}% completed</span>
            <span>
              {totalDonations.toLocaleString("en-US")} participants ·{" "}
              {countryCount.toLocaleString("en-US")} countries
            </span>
          </div>
        </motion.div>
      </section>

      {lastUnlockedCountry && (
        <section className="mx-auto max-w-5xl px-6 py-6">
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-8 text-center">
            <p className="text-sm uppercase tracking-wide text-emerald-200/75">
              Latest new country
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              🌍 {lastUnlockedCountry.country || "Unknown"} just joined
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">
              Is your country next?
            </p>
            <button
              onClick={handleDonate}
              disabled={isCheckoutLoading}
              className="mt-6 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCheckoutLoading ? "Redirecting..." : "Give €5"}
            </button>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/45">
                Live now
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                People are joining right now
              </h2>
            </div>

            <Link
              href="/live"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white/10"
            >
              Open live map
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-lg font-semibold">Latest donations</h3>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {liveDonations.length > 0 ? (
                    liveDonations.map((donation) => (
                      <motion.div
                        key={donation.id}
                        initial={{ opacity: 0, y: 10, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.24 }}
                        className={`flex items-center justify-between rounded-xl border-b border-white/10 pb-3 transition-all ${
                          newLiveDonationId === donation.id
                            ? "bg-white/5 px-3 py-2 ring-1 ring-emerald-400/30"
                            : ""
                        }`}
                      >
                        <div>
                          <p className="font-medium">
                            {donation.isFirstCountry ? "🎉 " : ""}
                            {donation.country || "Unknown"}
                          </p>
                          <p className="text-sm text-white/50">
                            {formatRelative(donation.createdAt)}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-bold">€{donation.amount}</span>
                          {donation.isFirstCountry && (
                            <p className="text-xs text-emerald-300">
                              New country
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-white/50">No donations yet.</p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-lg font-semibold">Top countries</h3>

              <div className="space-y-3">
                {topCountries.length > 0 ? (
                  topCountries.map((item, index) => (
                    <div
                      key={item.country}
                      className="flex items-center justify-between border-b border-white/10 pb-3"
                    >
                      <div>
                        <span className="font-medium">
                          {index + 1}. {item.country}
                        </span>
                        <p className="text-xs text-white/50">
                          {item.donations} participants
                        </p>
                      </div>
                      <span className="font-bold">€{item.amount}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-white/50">No country data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm uppercase tracking-wide text-white/45">
            Share launch
          </p>

          <h2 className="mt-2 text-3xl font-bold">Spread it</h2>

          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-white/10 bg-black/30 p-5 text-left text-white/85">
            <p>I just joined this weird internet experiment.</p>
            <p className="mt-3">Give €5.</p>
            <p>No reward.</p>
            <p>Just to see how far it spreads.</p>
            <p className="mt-3">
              Already: €{totalAmount.toLocaleString("en-US")} raised ·{" "}
              {totalDonations.toLocaleString("en-US")} people ·{" "}
              {countryCount.toLocaleString("en-US")} countries
            </p>
            <p className="mt-3 break-all text-white/50">{shareUrl}</p>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={handleShare}
              className="inline-flex rounded-2xl border border-white/15 bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Share on X
            </button>

            <button
              onClick={handleCopyShare}
              className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white/10"
            >
              {shareCopied ? "Copied" : "Copy launch text"}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h2 className="text-3xl font-bold">Give €5. Be part of it.</h2>

          <button
            onClick={handleDonate}
            disabled={isCheckoutLoading}
            className="mt-8 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCheckoutLoading ? "Redirecting..." : "Give €5"}
          </button>
        </div>
      </section>

      <AnimatePresence>
        {toastDonation && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-24 right-4 z-50 max-w-sm rounded-2xl border border-indigo-500/30 bg-black/90 px-5 py-4 text-white shadow-2xl backdrop-blur sm:bottom-6 sm:right-6"
          >
            <p className="text-sm uppercase tracking-wide text-indigo-300/80">
              Live update
            </p>

            {toastDonation.isFirstCountry ? (
              <>
                <p className="mt-2 text-lg font-semibold">
                  🌍 New country unlocked: {toastDonation.country || "Unknown"}
                </p>
                <p className="mt-1 text-indigo-300">
                  {toastDonation.countryCount ?? ""} countries participating
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-lg font-semibold">
                  🟢 {toastDonation.country || "Unknown"} just joined (+€5)
                </p>
                <p className="mt-1 text-indigo-300">
                  The experiment is moving
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 p-3 backdrop-blur md:hidden">
        <button
          onClick={handleDonate}
          disabled={isCheckoutLoading}
          className="w-full rounded-2xl bg-white px-6 py-4 text-base font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCheckoutLoading
            ? "Redirecting..."
            : `Give €5 · ${countryCount.toLocaleString("en-US")} countries`}
        </button>
      </div>
<footer className="mt-24 text-center text-xs text-white/30 space-x-3">
  <a href="/privacy" className="underline hover:text-white">
    Privacy
  </a>
  <a href="/terms" className="underline hover:text-white">
    Terms
  </a>
</footer>
    </main>

  )
}


