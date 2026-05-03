"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import FakeLiveProcessing from "@/components/FakeLiveProcessing"
import { formatCountryDisplay, formatCountryName } from "@/lib/country"

type ImpactType = "NEW_COUNTRY" | "TOP5" | "BATTLE" | "MOVE"

type OrderResponse = {
  id?: string
  country?: string | null
  amount?: number
  totalAmount?: number | null
  totalDonations?: number | null
  countryCount?: number | null
  isFirstCountry?: boolean
  countryRank?: number | null
  impactType?: ImpactType
  impactData?: {
    country?: string
    countryRank?: number | null
    opponent?: string
    gap?: number
    ahead?: boolean
    target?: string | null
  } | null
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
}

function formatMoney(amount?: number | null) {
  if (typeof amount !== "number") return "5"
  return amount.toLocaleString("en-US")
}

function getScenario(order: OrderResponse) {
  const country = formatCountryName(order.country)
  const impactType = order.impactType || "MOVE"
  const impactData = order.impactData || {}
  const amount = formatMoney(order.amount ?? 5)
  const opponent = impactData.opponent
    ? formatCountryName(impactData.opponent)
    : null

  switch (impactType) {
    case "NEW_COUNTRY":
      return {
        badge: "NEW COUNTRY",
        title: `You just put ${country} on the map.`,
        subtitle: `You are the first participant from ${country}.`,
        body: "That moment is now public.",
        emotion: "You started something.",
        urgency: "Now someone else can respond.",
        shareTitle: `Share that ${country} just entered`,
        shareText: `I just put ${country} on the map.

€${amount}.
No reward.

This is live now.`,
      }

    case "TOP5":
      return {
        badge: "TOP 5",
        title: `You pushed ${country} into the top 5.`,
        subtitle: "Your payment changed the ranking instantly.",
        body: "People can see the shift right now.",
        emotion: "You caused a visible move.",
        urgency: "That position can still change fast.",
        shareTitle: "Share what you just changed",
        shareText: `I just pushed ${country} into the top 5.

€${amount}.
No reward.

This is weird.`,
      }

    case "BATTLE":
      return {
        badge: "LIVE BATTLE",
        title: `You just moved ${country}.`,
        subtitle: opponent
          ? `${country} is now only €${impactData.gap ?? 0} away from ${opponent}.`
          : "Your payment tightened the competition instantly.",
        body: "You made the ranking more unstable.",
        emotion: "You caused pressure.",
        urgency: opponent
          ? `${opponent} can answer at any moment.`
          : "This can flip at any moment.",
        shareTitle: "Share the battle",
        shareText: opponent
          ? `I just moved ${country} closer to ${opponent}.

Only €${impactData.gap ?? 0} between them now.

€${amount}.
No reward.`
          : `I just made the ranking tighter on GiveFive.

€${amount}.
No reward.`,
      }

    default:
      return {
        badge: "LIVE IMPACT",
        title: `You just moved ${country}.`,
        subtitle: "Your payment changed the live experiment.",
        body: "This happened in public, in real time.",
        emotion: "You caused this.",
        urgency: "The ranking is still moving.",
        shareTitle: "Share what you just did",
        shareText: `I just moved ${country}.

€${amount}.
No reward.

This is live.
This is weird.`,
      }
  }
}

function getShareCardData(
  order: OrderResponse,
  scenario: ReturnType<typeof getScenario>
) {
  const country = formatCountryDisplay(order.country)
  const rank = order.countryRank

  switch (order.impactType) {
    case "NEW_COUNTRY":
      return {
        eyebrow: "NEW COUNTRY",
        title: `${country} just entered`,
        subtitle: "€5. No reward. Public impact.",
        footer: rank ? `Now ranked #${rank}` : "Live on GiveFive",
      }

    case "TOP5":
      return {
        eyebrow: "TOP 5",
        title: `${country} entered the top 5`,
        subtitle: "One payment changed the ranking.",
        footer: rank ? `Now ranked #${rank}` : "Live on GiveFive",
      }

    case "BATTLE":
      return {
        eyebrow: "BATTLE",
        title: scenario.title,
        subtitle: scenario.subtitle,
        footer: rank ? `${country} is now #${rank}` : "Live on GiveFive",
      }

    default:
      return {
        eyebrow: "LIVE IMPACT",
        title: `${country} just moved`,
        subtitle: "€5. No reward. This is weird.",
        footer: rank ? `Now ranked #${rank}` : "Live on GiveFive",
      }
  }
}

function ShareCard({
  eyebrow,
  title,
  subtitle,
  footer,
}: {
  eyebrow: string
  title: string
  subtitle: string
  footer: string
}) {
  return (
    <div className="w-full overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] p-5 text-left shadow-xl transition-transform duration-300 hover:-translate-y-1">
      <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-emerald-300">
        {eyebrow}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </p>
        <p className="mt-3 max-w-xl text-sm text-white/65 sm:text-base">
          {subtitle}
        </p>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
        <div>
          <p className="text-xs text-white/40">GiveFive</p>
          <p className="text-sm font-medium text-white/80">
            People are paying €5 for nothing.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-white/40">Status</p>
          <p className="text-sm font-medium text-white/80">{footer}</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-5">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-white/55">{helper}</p>
    </div>
  )
}

function TensionBlock({ order }: { order: OrderResponse }) {
  const opponent = order.impactData?.opponent
    ? formatCountryName(order.impactData.opponent)
    : null

  if (order.impactType === "BATTLE" && opponent) {
    return (
      <div className="rounded-[28px] border border-red-400/20 bg-red-400/10 px-6 py-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-200/80">
          Live tension
        </p>
        <p className="mt-3 text-2xl font-semibold text-red-50 sm:text-3xl">
          {opponent} is only €{order.impactData?.gap ?? 0} away.
        </p>
        <p className="mt-3 text-sm text-red-100/75 sm:text-base">
          This can flip at any moment.
        </p>
      </div>
    )
  }

  if (order.impactType === "TOP5") {
    return (
      <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 px-6 py-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">
          Ranking move
        </p>
        <p className="mt-3 text-2xl font-semibold text-amber-50 sm:text-3xl">
          You just created a visible shift.
        </p>
        <p className="mt-3 text-sm text-amber-100/75 sm:text-base">
          People can see the move right now.
        </p>
      </div>
    )
  }

  if (order.impactType === "NEW_COUNTRY") {
    return (
      <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 px-6 py-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200/80">
          New signal
        </p>
        <p className="mt-3 text-2xl font-semibold text-emerald-50 sm:text-3xl">
          A new country just appeared on the board.
        </p>
        <p className="mt-3 text-sm text-emerald-100/75 sm:text-base">
          That moment is public now.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 px-6 py-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
        Live movement
      </p>
      <p className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
        The ranking is still moving.
      </p>
      <p className="mt-3 text-sm text-white/65 sm:text-base">
        What you did is already part of it.
      </p>
    </div>
  )
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id") || undefined

  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadOrderWithRetry() {
      if (!sessionId) {
        setLoading(false)
        return
      }

      let attempts = 0
      const maxAttempts = 15

      while (attempts < maxAttempts) {
        try {
          const res = await fetch(
            `/api/order-by-session?session_id=${encodeURIComponent(sessionId)}`,
            { cache: "no-store" }
          )

          if (res.ok) {
            const data = await res.json()

            if (!cancelled) {
              setOrder(data)
              setLoading(false)
            }
            return
          }

          if (res.status === 202) {
            await new Promise((resolve) => setTimeout(resolve, 500))
            attempts++
            continue
          }

          if (res.status === 404) {
            console.error("[success] order not found")
            break
          }
        } catch (error) {
          console.error("[success] fetch error:", error)
        }

        await new Promise((resolve) => setTimeout(resolve, 500))
        attempts++
      }

      if (!cancelled) {
        setLoading(false)
        setOrder(null)
      }
    }

    loadOrderWithRetry()

    return () => {
      cancelled = true
    }
  }, [sessionId])

  const sharePageUrl = useMemo(() => {
    if (!order?.id) return getBaseUrl()
    return `${getBaseUrl()}/share/${order.id}`
  }, [order])

  const scenario = useMemo(() => {
    if (!order) return null
    return getScenario(order)
  }, [order])

  const shareCard = useMemo(() => {
    if (!order || !scenario) return null
    return getShareCardData(order, scenario)
  }, [order, scenario])

  const shareText = scenario?.shareText ?? ""
  const copyText = shareText ? `${shareText}\n\n${sharePageUrl}` : sharePageUrl

  const xIntent = `https://x.com/intent/post?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(sharePageUrl)}`

  async function handleCopy() {
    try {
      if (!navigator?.clipboard) {
        throw new Error("Clipboard API unavailable")
      }

      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center overflow-hidden px-6 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute left-1/2 top-32 h-64 w-[30rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
          </div>

          <div className="relative z-10 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            ✓ Payment confirmed
          </div>

          <h1 className="relative z-10 mt-6 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
            Your move is being processed...
          </h1>

          <p className="relative z-10 mt-5 max-w-2xl text-lg text-white/60 sm:text-xl">
            Your €5 is being turned into visible impact.
          </p>

          <p className="relative z-10 mt-2 text-sm text-white/50">
            Waiting for confirmation from the network
          </p>

          <div className="relative z-10 mt-6">
            <FakeLiveProcessing />
          </div>
        </section>
      </main>
    )
  }

  if (!order || !scenario) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center overflow-hidden px-6 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute left-1/2 top-32 h-64 w-[30rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
          </div>

          <div className="relative z-10 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            Processing complete
          </div>

          <h1 className="relative z-10 mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Your payment was received.
          </h1>

          <p className="relative z-10 mt-5 max-w-xl text-lg text-white/60">
            We could not load your exact impact yet, but your participation is in.
          </p>

          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/live"
              className="inline-flex rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Watch live map
            </Link>

            <Link
              href="/stats"
              className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white/10"
            >
              View stats
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-32 pt-20 md:pb-20">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-1/2 top-28 h-64 w-[34rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            ✓ You changed the game
          </div>

          <div className="mt-5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
            {scenario.badge}
          </div>

          <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            {scenario.title}
          </h1>

          <p className="mt-5 text-xl font-medium text-white/82 sm:text-2xl">
            {scenario.emotion}
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-base text-white/65 sm:text-lg">
            {scenario.subtitle}
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-base text-white/50 sm:text-lg">
            {scenario.body}
          </p>

          <p className="mt-5 text-[11px] uppercase tracking-[0.28em] text-white/40">
            {scenario.urgency}
          </p>

          <div className="mt-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            People are reacting right now
          </div>
        </div>

        <div className="relative z-10 mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-emerald-400/20 bg-gradient-to-b from-emerald-400/10 to-white/[0.03] p-6 shadow-2xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/80">
              Share now
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {scenario.shareTitle}
            </h2>

            <p className="mt-3 max-w-xl text-white/65">
              Best shared right now. This is live and screenshotable.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href={xIntent}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-[220px] justify-center rounded-2xl bg-white px-7 py-4 text-lg font-semibold text-black transition hover:opacity-90"
              >
                Share on X
              </a>

              <button
                onClick={handleCopy}
                className="inline-flex min-w-[220px] justify-center rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-lg font-semibold transition hover:bg-white/10"
              >
                {copied ? "Copied" : "Copy message"}
              </button>
            </div>

            <div className="mt-3">
              <Link
                href={sharePageUrl}
                target="_blank"
                className="inline-flex w-full justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10"
              >
                Preview shared page
              </Link>
            </div>

            <p className="mt-4 text-sm text-white/45">
              Post before the ranking moves again.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-left whitespace-pre-line text-white/85">
              {copyText}
            </div>

            {shareCard && (
              <div className="mt-5">
                <ShareCard
                  eyebrow={shareCard.eyebrow}
                  title={shareCard.title}
                  subtitle={shareCard.subtitle}
                  footer={shareCard.footer}
                />
              </div>
            )}

            <p className="mt-4 text-sm text-white/45">
              The ranking is still moving…
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
                Current status
              </p>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {order.countryRank && order.country
                      ? `${formatCountryDisplay(order.country)} is now #${order.countryRank}`
                      : "Your move is live"}
                  </p>
                  <p className="mt-2 text-sm text-white/55">
                    People can see this changing in real time.
                  </p>
                </div>

                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
                  <div className="relative rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                    LIVE
                  </div>
                </div>
              </div>
            </div>

            <TensionBlock order={order} />

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <StatCard
                label="You gave"
                value={`€${order.amount ?? 5}`}
                helper="One move. Public impact."
              />
              <StatCard
                label="Participants"
                value={order.totalDonations?.toLocaleString("en-US") ?? "—"}
                helper="People already inside."
              />
              <StatCard
                label="Countries"
                value={order.countryCount?.toLocaleString("en-US") ?? "—"}
                helper="Visible on the board."
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 hidden items-center justify-center gap-3 sm:flex">
          <Link
            href="/live"
            className="inline-flex min-w-[190px] justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white/10"
          >
            Watch live map
          </Link>

          <Link
            href="/stats"
            className="inline-flex min-w-[190px] justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white/10"
          >
            View stats
          </Link>
        </div>

        {typeof order.totalAmount === "number" && (
          <div className="relative z-10 mt-8 text-center text-sm text-white/42">
            Total now at €{order.totalAmount.toLocaleString("en-US")}
          </div>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/80 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md gap-3">
          <a
            href={xIntent}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white px-4 py-3 font-semibold text-black"
          >
            Share on X
          </a>

          <button
            onClick={handleCopy}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-semibold text-white"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </main>
  )
}