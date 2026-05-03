import Link from "next/link"
import { prisma } from "@/lib/prisma"
import LiveMap from "@/components/LiveMap"

export default async function LivePage() {
  const [donations, aggregate, grouped, latest] = await Promise.all([
    prisma.order.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        id: true,
        amount: true,
        country: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        isFirstCountry: true,
      },
    }),
    prisma.order.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.order.groupBy({
      by: ["country"],
      _count: {
        country: true,
      },
      orderBy: {
        _count: {
          country: "desc",
        },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        amount: true,
        country: true,
        createdAt: true,
        isFirstCountry: true,
      },
    }),
  ])

  const serialized = donations.map((donation) => ({
    id: donation.id,
    amount: donation.amount,
    country: donation.country,
    latitude: donation.latitude,
    longitude: donation.longitude,
    createdAt: donation.createdAt.toISOString(),
    isFirstCountry: donation.isFirstCountry,
  }))

  const totalAmount = aggregate._sum.amount ?? 0
  const totalDonations = aggregate._count.id ?? 0
  const countryCount = grouped.filter((item) => item.country).length

  const topCountries = grouped
    .filter((item) => item.country)
    .slice(0, 5)
    .map((item) => ({
      country: item.country as string,
      donations: item._count.country,
    }))

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:py-10">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] px-6 py-10 sm:px-8 sm:py-12">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute left-1/2 top-10 h-56 w-56 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute left-1/2 top-16 h-48 w-[26rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
                🌍 Live public internet experiment
              </div>

              <div className="space-y-3">
                <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Watch the internet move in real time.
                </h1>

                <p className="max-w-2xl text-base text-white/60 sm:text-lg">
                  Every donation appears live on the world map. No reward. No
                  promise. Just public participation spreading country by
                  country.
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
                  href="/stats"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  📊 Stats
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
                See it live. Join in one click.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-5">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Total raised
            </p>
            <p className="mt-2 text-3xl font-semibold">
              €{totalAmount.toLocaleString("en-US")}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-5">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Participants
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {totalDonations.toLocaleString("en-US")}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-5">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Countries
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {countryCount.toLocaleString("en-US")}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-5">
            <p className="text-xs uppercase tracking-wide text-emerald-200/70">
              Mission
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {countryCount.toLocaleString("en-US")} / 195
            </p>
            <p className="mt-2 text-sm text-white/50">
              countries joined the experiment
            </p>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.02]">
          <LiveMap
            initialDonations={serialized}
            initialTotalAmount={totalAmount}
            initialTotalDonations={totalDonations}
            initialCountryCount={countryCount}
          />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                  Latest donations
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  The signal is still moving
                </h2>
              </div>

              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/50">
                LIVE
              </span>
            </div>

            <div className="space-y-3">
              {latest.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">
                      {donation.country ?? "Unknown location"}
                    </p>
                    <p className="text-sm text-white/45">
                      {donation.isFirstCountry
                        ? "🎉 New country joined"
                        : "Joined the experiment"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-white">
                      €{donation.amount.toLocaleString("en-US")}
                    </p>
                    <p className="text-sm text-white/45">
                      {new Date(donation.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-white/45">
              Top countries
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Countries pushing the experiment
            </h2>

            <div className="mt-5 space-y-3">
              {topCountries.map((item, index) => (
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

                  <div className="text-sm font-medium text-white/60">
                    +€{(item.donations * 5).toLocaleString("en-US")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between text-xs text-white/35">
          <span>GiveMeFive experiment</span>
          <span>Real-time global donations</span>
        </div>
      </div>
    </main>
  )
}