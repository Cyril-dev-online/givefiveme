import Link from "next/link"
import type { Metadata } from "next"
import {
  formatCountryDisplay, formatCountryName } from "@/lib/country"

type ImpactType = "NEW_COUNTRY" | "TOP5" | "BATTLE" | "MOVE"

type ShareData = {
  id: string
  country?: string | null
  amount?: number
  countryRank?: number | null
  impactType?: ImpactType
  impactData?: {
    opponent?: string
    gap?: number
  } | null
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
}

async function getShareData(id: string): Promise<ShareData | null> {
  const baseUrl = getBaseUrl()

  try {
    const res = await fetch(
      `${baseUrl}/api/public-share?id=${encodeURIComponent(id)}`,
      {
        cache: "no-store",
      }
    )

    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function getScenario(data: ShareData) {
  const country = formatCountryName(data.country)

  const opponent = data.impactData?.opponent
    ? formatCountryName(data.impactData.opponent)
    : null

  switch (data.impactType) {
    case "NEW_COUNTRY":
      return {
        badge: "NEW COUNTRY",
        title: `${country} just entered`,
        subtitle: `Someone just put ${country} on the map.`,
        body: "€5. No reward. Public impact.",
      }

    case "TOP5":
      return {
        badge: "TOP 5",
        title: `${country} entered the top 5`,
        subtitle: `Someone just pushed ${country} up the ranking.`,
        body: "€5. No reward. Live movement.",
      }

    case "BATTLE":
      return {
        badge: "LIVE BATTLE",
        title: `${country} is in a live battle`,
        subtitle: opponent
          ? `Only €${data.impactData?.gap ?? 0} between ${country} and ${opponent}.`
          : `${country} just moved in the ranking.`,
        body: "This can flip at any moment.",
      }

    default:
      return {
        badge: "LIVE IMPACT",
        title: `${country} just moved`,
        subtitle: `Someone just changed the live ranking.`,
        body: "€5. No reward. This is weird.",
      }
  }
}

export async function generateMetadata(
  props: {
    params: Promise<{ id: string }>
  }
): Promise<Metadata> {
  const params = await props.params
  const data = await getShareData(params.id)
  const baseUrl = getBaseUrl()

  if (!data) {
    return {
      title: "GiveFive",
      description: "€5. No reward. Public impact.",
    }
  }

  const scenario = getScenario(data)
  const ogUrl =
    `${baseUrl}/api/og` +
    `?country=${encodeURIComponent(data.country || "A country")}` +
    `&type=${encodeURIComponent(data.impactType || "MOVE")}` +
    `&rank=${encodeURIComponent(data.countryRank?.toString() || "")}` +
    `&gap=${encodeURIComponent(data.impactData?.gap?.toString() || "")}` +
    `&opponent=${encodeURIComponent(data.impactData?.opponent || "")}`

  const pageUrl = `${baseUrl}/share/${params.id}`

  return {
    title: scenario.title,
    description: scenario.subtitle,
    openGraph: {
      title: scenario.title,
      description: scenario.subtitle,
      url: pageUrl,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: scenario.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: scenario.title,
      description: scenario.subtitle,
      images: [ogUrl],
    },
  }
}

export default async function SharePage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params
  const data = await getShareData(params.id)

  if (!data) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <section className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            Share link
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            This moment could not be loaded.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-white/60">
            The shared event may no longer be available.
          </p>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Go to GiveFive
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const scenario = getScenario(data)

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-20 pt-20">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-1/2 top-28 h-64 w-[34rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            {scenario.badge}
          </div>

          <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            {scenario.title}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-xl text-white/75 sm:text-2xl">
            {scenario.subtitle}
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-base text-white/55 sm:text-lg">
            {scenario.body}
          </p>
        </div>

        <div className="relative z-10 mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">
              Live status
            </p>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] p-5">
              <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-emerald-300">
                {scenario.badge}
              </div>

              <p className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {scenario.title}
              </p>

              <p className="mt-3 text-sm text-white/65 sm:text-base">
                {scenario.subtitle}
              </p>

              <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs text-white/40">GiveFive</p>
                  <p className="text-sm font-medium text-white/80">
                    People are paying €5 for nothing.
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-white/40">Status</p>
                  <p className="text-sm font-medium text-white/80">
                    {data.countryRank ? `#${data.countryRank}` : "Live"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                  Country
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                  {formatCountryDisplay(data.country)}
                </p>
                <p className="mt-2 text-sm text-white/55">
                  Visible in the live ranking.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                  Rank
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                  {data.countryRank ? `#${data.countryRank}` : "Live"}
                </p>
                <p className="mt-2 text-sm text-white/55">
                  The board keeps moving.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-emerald-400/20 bg-gradient-to-b from-emerald-400/10 to-white/[0.03] p-6 shadow-2xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/80">
              Join now
            </p>

           <p className="mt-3 text-xl font-semibold text-white sm:text-2xl">
  Your €5 could flip this ranking instantly.
</p>

            <p className="mt-3 max-w-xl text-white/65">
              €5. No reward. Public impact. Live ranking.
            </p>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-black/30 p-5">
              <p className="text-sm text-white/75">
                Someone just changed the ranking.
              </p>
              <p className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                Your move could change it again.
              </p>
              <p className="mt-3 text-sm text-white/55">
                Best done while the momentum is live.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/"
                className="inline-flex justify-center rounded-2xl bg-white px-7 py-4 text-lg font-semibold text-black transition hover:opacity-90"
              >
                Pay €5 and move your country
              </Link>

              <Link
                href="/live"
                className="inline-flex justify-center rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-lg font-semibold transition hover:bg-white/10"
              >
                Watch live map
              </Link>
            </div>

            <p className="mt-4 text-sm text-white/45">
              People are reacting in real time.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}