import Link from "next/link"

type CountryStat = {
  country: string
  amount: number
  donations: number
}

type Donation = {
  id: string
  amount: number
  country: string | null
  latitude?: number | null
  longitude?: number | null
  createdAt: string
  isFirstCountry?: boolean
}

type TimelinePoint = {
  date: string
  amount?: number
  donations?: number
  cumulativeAmount: number
  cumulativeDonations?: number
}

type StatsResponse = {
  totalAmount: number
  totalDonations: number
  countryCount: number
  topCountries?: CountryStat[]
  countryDistribution?: CountryStat[]
  latest?: Donation[]
  timeline?: TimelinePoint[]
  latestNewCountry?: {
    country: string | null
    createdAt: string
  } | null
  mostActive24h?: {
    country: string
    donations: number
    amount: number
  } | null
  fastestGrowingCountry?: {
    country: string
    donations24h: number
    amount24h: number
  } | null
  momentum?: {
    amount1h?: number
    participants1h?: number
    newCountries24h?: number
  } | null
  countryStatus?: {
    leader: string
    challenger: string | null
    gap: number
    message: string
  } | null
  countryBattle?: {
    leader: {
      country: string
      donations: number
    }
    challenger: {
      country: string
      donations: number
    }
    gap: number
    message: string
  } | null
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function buildLinePath(
  values: number[],
  width: number,
  height: number,
  padding: number
) {
  if (values.length === 0) return ""

  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = Math.max(max - min, 1)

  return values
    .map((value, index) => {
      const x =
        padding +
        (index * (width - padding * 2)) / Math.max(values.length - 1, 1)
      const y =
        height - padding - ((value - min) / range) * (height - padding * 2)

      return `${index === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")
}

function buildAreaPath(
  values: number[],
  width: number,
  height: number,
  padding: number
) {
  if (values.length === 0) return ""

  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = Math.max(max - min, 1)

  const points = values.map((value, index) => {
    const x =
      padding +
      (index * (width - padding * 2)) / Math.max(values.length - 1, 1)
    const y =
      height - padding - ((value - min) / range) * (height - padding * 2)

    return { x, y }
  })

  const first = points[0]
  const last = points[points.length - 1]

  return [
    `M ${first.x} ${height - padding}`,
    ...points.map((p) => `L ${p.x} ${p.y}`),
    `L ${last.x} ${height - padding}`,
    "Z",
  ].join(" ")
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? `${(value / max) * 100}%` : "0%"

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
      <div className="h-full rounded-full bg-white/80" style={{ width }} />
    </div>
  )
}

function StatCard({
  label,
  value,
  detail,
  accent = "default",
}: {
  label: string
  value: string
  detail?: string
  accent?: "default" | "emerald"
}) {
  const emerald = accent === "emerald"

  return (
    <div
      className={`rounded-3xl border p-6 ${
        emerald
          ? "border-emerald-400/20 bg-emerald-400/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-[0.2em] ${
          emerald ? "text-emerald-200/70" : "text-white/40"
        }`}
      >
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-2 text-sm text-white/45">{detail}</p> : null}
    </div>
  )
}

function InsightCard({
  label,
  value,
  detail,
  accent = "default",
}: {
  label: string
  value: string
  detail?: string
  accent?: "default" | "emerald"
}) {
  const emerald = accent === "emerald"

  return (
    <div
      className={`rounded-3xl border p-6 ${
        emerald
          ? "border-emerald-400/20 bg-emerald-400/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-[0.22em] ${
          emerald ? "text-emerald-200/70" : "text-white/40"
        }`}
      >
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-2 text-sm text-white/45">{detail}</p> : null}
    </div>
  )
}

export default async function StatsPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    "http://localhost:3000"

  const res = await fetch(`${baseUrl}/api/stats`, { cache: "no-store" })

  if (!res.ok) {
    throw new Error("Failed to load stats")
  }

  const stats: StatsResponse = await res.json()

  const timeline = stats.timeline ?? []
  const topCountries = stats.topCountries ?? []
  const countryDistribution = stats.countryDistribution ?? []
  const latest = stats.latest ?? []

  const timelineValues = timeline.map((point) => point.cumulativeAmount)
  const chartWidth = 960
  const chartHeight = 320
  const chartPadding = 28

  const linePath = buildLinePath(
    timelineValues,
    chartWidth,
    chartHeight,
    chartPadding
  )

  const areaPath = buildAreaPath(
    timelineValues,
    chartWidth,
    chartHeight,
    chartPadding
  )

  const maxCountryDonations = Math.max(
    ...countryDistribution.map((item) => item.donations),
    1
  )

  const latestCountry = latest.find((item) => item.country)?.country ?? "Unknown"

  const averageDonationPerCountry =
    stats.countryCount > 0 ? stats.totalAmount / stats.countryCount : 0

  const shareUrl = `${baseUrl}/stats`
  const shareText = `The GiveMeFive experiment is now at:

€${stats.totalAmount.toLocaleString("en-US")} raised
${stats.totalDonations.toLocaleString("en-US")} people
${stats.countryCount.toLocaleString("en-US")} countries

Live stats:
${shareUrl}`

  const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}`

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] px-6 py-10 sm:px-8 sm:py-12">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute left-1/2 top-10 h-56 w-56 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute left-1/2 top-16 h-48 w-[26rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
                📊 Public experiment stats
              </div>

              <div className="space-y-3">
                <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  The experiment, in numbers.
                </h1>

                <p className="max-w-2xl text-base text-white/60 sm:text-lg">
                  A sober view of the global experiment — raised amount,
                  participation, country spread, recent movement, and current
                  momentum.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link
                  href="/"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  ← Back home
                </Link>

                <Link
                  href="/live"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  🌍 Live map
                </Link>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              <Link
                href="/"
                className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Give €5
              </Link>

              <p className="text-sm text-white/45">
                Explore the numbers. Join in one click.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total raised"
            value={`€${stats.totalAmount.toLocaleString("en-US")}`}
          />
          <StatCard
            label="Participants"
            value={stats.totalDonations.toLocaleString("en-US")}
          />
          <StatCard
            label="Countries"
            value={stats.countryCount.toLocaleString("en-US")}
            detail="Participating in the experiment"
            accent="emerald"
          />
          <StatCard
            label="Latest country"
            value={latestCountry}
            detail="Most recently seen in activity"
          />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <InsightCard
            label="Latest new country"
            value={stats.latestNewCountry?.country ?? "—"}
            detail={
              stats.latestNewCountry
                ? `Joined ${new Date(
                    stats.latestNewCountry.createdAt
                  ).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "No new country yet"
            }
            accent="emerald"
          />

          <InsightCard
            label="Most active (24h)"
            value={stats.mostActive24h?.country ?? "—"}
            detail={
              stats.mostActive24h
                ? `${stats.mostActive24h.donations.toLocaleString(
                    "en-US"
                  )} donations · €${stats.mostActive24h.amount.toLocaleString(
                    "en-US"
                  )}`
                : "No activity yet"
            }
          />

          <InsightCard
            label="Average per country"
            value={`€${Math.round(averageDonationPerCountry).toLocaleString(
              "en-US"
            )}`}
            detail="Total divided by participating countries"
          />
        </section>

        <section className="mt-6 rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/70">
              Momentum
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              What’s happening now
            </h2>
            <p className="mt-2 text-sm text-white/55">
              The experiment becomes more compelling when it feels active.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Last 60 min
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                €{(stats.momentum?.amount1h ?? 0).toLocaleString("en-US")}
              </p>
              <p className="mt-2 text-sm text-white/45">raised recently</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Last 60 min
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {(stats.momentum?.participants1h ?? 0).toLocaleString("en-US")}
              </p>
              <p className="mt-2 text-sm text-white/45">people joined</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Last 24h
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {(stats.momentum?.newCountries24h ?? 0).toLocaleString("en-US")}
              </p>
              <p className="mt-2 text-sm text-white/45">
                new countries unlocked
              </p>
            </div>
          </div>
        </section>

        {stats.countryBattle && (
          <section className="mt-6 rounded-[28px] border border-white/10 bg-zinc-950 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                  Country battle
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  The race is live
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Small gaps create the strongest sharing pressure.
                </p>
              </div>

              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                LIVE
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-white/45">Current battle</p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {stats.countryBattle.message}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-white/45">Countries</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {stats.countryBattle.challenger.country} vs{" "}
                  {stats.countryBattle.leader.country}
                </p>
                <p className="mt-2 text-sm text-white/45">
                  Gap: {stats.countryBattle.gap}
                </p>
              </div>
            </div>
          </section>
        )}

        {stats.fastestGrowingCountry && (
          <section className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                  Fastest growing
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {stats.fastestGrowingCountry.country} is moving fastest
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Most active country in the last 24 hours.
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
                24H
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <p className="text-sm text-white/45">People joined</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {stats.fastestGrowingCountry.donations24h.toLocaleString(
                    "en-US"
                  )}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <p className="text-sm text-white/45">Amount added</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  €{stats.fastestGrowingCountry.amount24h.toLocaleString(
                    "en-US"
                  )}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Growth
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Growth so far</h2>
            </div>

            <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/50">
              {timeline.length} timeline points
            </div>
          </div>

          {timeline.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-black/30 p-4">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-[320px] w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(74,222,128,0.22)" />
                    <stop offset="100%" stopColor="rgba(74,222,128,0.02)" />
                  </linearGradient>
                </defs>

                {[0.25, 0.5, 0.75].map((ratio) => {
                  const y =
                    chartHeight -
                    chartPadding -
                    ratio * (chartHeight - chartPadding * 2)

                  return (
                    <line
                      key={ratio}
                      x1={chartPadding}
                      x2={chartWidth - chartPadding}
                      y1={y}
                      y2={y}
                      stroke="rgba(255,255,255,0.08)"
                      strokeDasharray="4 6"
                    />
                  )
                })}

                <path d={areaPath} fill="url(#areaFill)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="rgba(255,255,255,0.92)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/45 sm:grid-cols-4">
                {timeline
                  .filter((_, index) => {
                    if (timeline.length <= 4) return true
                    const step = Math.ceil(timeline.length / 4)
                    return index % step === 0 || index === timeline.length - 1
                  })
                  .slice(0, 4)
                  .map((point) => (
                    <div key={point.date}>
                      <p>{formatShortDate(point.date)}</p>
                      <p className="mt-1 text-white/70">
                        €{point.cumulativeAmount.toLocaleString("en-US")}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-black/30 p-8 text-white/50">
              No timeline data yet.
            </div>
          )}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Countries
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Country distribution
              </h2>
            </div>

            <div className="space-y-4">
              {countryDistribution.length > 0 ? (
                countryDistribution.slice(0, 10).map((item) => (
                  <div key={item.country} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white">
                          {item.country}
                        </span>
                        <span className="text-white/40">
                          {item.donations.toLocaleString("en-US")} donations
                        </span>
                      </div>

                      <span className="text-white/70">
                        €{item.amount.toLocaleString("en-US")}
                      </span>
                    </div>

                    <MiniBar value={item.donations} max={maxCountryDonations} />
                  </div>
                ))
              ) : (
                <p className="text-white/50">No country data yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-zinc-950 p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Leaders
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Top countries</h2>
            </div>

            <div className="space-y-3">
              {topCountries.length > 0 ? (
                topCountries.map((item, index) => (
                  <div
                    key={item.country}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white/70">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-medium text-white">{item.country}</p>
                        <p className="text-sm text-white/45">
                          {item.donations.toLocaleString("en-US")} donations
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-white">
                        €{item.amount.toLocaleString("en-US")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/50">No top countries yet.</p>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-zinc-950 p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Recent activity
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Latest donations</h2>
            </div>

            <Link
              href="/live"
              className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              Watch live map
            </Link>
          </div>

          <div className="space-y-3">
            {latest.length > 0 ? (
              latest.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">
                      {donation.isFirstCountry ? "🎉 " : ""}
                      {donation.country ?? "Unknown location"}
                    </p>
                    <p className="text-sm text-white/45">
                      {donation.isFirstCountry
                        ? "New country joined"
                        : "Joined the experiment"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-white">
                      €{donation.amount.toLocaleString("en-US")}
                    </p>
                    <p className="text-sm text-white/45">
                      {formatDateTime(donation.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/50">No donations yet.</p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Share stats
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Spread the momentum
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-white/50">
                The experiment becomes more interesting as more people and more
                countries join.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={twitterIntent}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Share on X
              </a>

              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
              >
                Join the experiment
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}