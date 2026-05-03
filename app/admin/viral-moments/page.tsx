import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCountryName } from "@/lib/country"
import { CopyButton } from "./CopyButton"


export const dynamic = "force-dynamic"

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
}

function formatDate(date: Date | null) {
  if (!date) return "—"

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function buildScript(moment: {
  type: string
  country: string
  opponent: string | null
  gap: number | null
}) {
  const country = formatCountryName(moment.country)
  const opponent = moment.opponent
    ? formatCountryName(moment.opponent)
    : null

  if (moment.type === "BATTLE") {
    return `🎤 VOIX FR:
Il y a seulement ${moment.gap ?? "?"}€ entre ${country}${opponent ? ` et ${opponent}` : ""}.
Un paiement peut tout changer.
C’est en direct.

🎤 VOICE EN:
There is only €${moment.gap ?? "?"} between ${country}${opponent ? ` and ${opponent}` : ""}.
One payment could flip this.
This is happening live.

📱 OVERLAY:
${moment.gap ?? "?"}€ d'écart
ça va changer
regarde`
  }

  if (moment.type === "NEW_COUNTRY") {
    return `🎤 VOIX FR:
${country} vient d’apparaître.
Quelqu’un a payé 5€.
C’est tout.

🎤 VOICE EN:
${country} just entered.
Someone paid €5.
That is all it takes.

📱 OVERLAY:
nouveau pays
5€ seulement
en direct`
  }

  return `🎤 VOIX FR:
${country} vient d’entrer dans le top 5.
Un paiement a suffi.
C’est en direct.

🎤 VOICE EN:
${country} entered the top 5.
One payment did that.
This is live.

📱 OVERLAY:
top 5
ça bouge
en direct`
}

export default async function Page() {
  const moments = await prisma.viralMoment.findMany({
    orderBy: [
      { filmedAt: "asc" },
      { score: "desc" },
      { createdAt: "desc" },
    ],
    take: 50,
  })

  const baseUrl = getBaseUrl()

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Viral Moments</h1>

        <div className="grid gap-4">
          {moments.map((moment) => (
            <article
              key={moment.id}
              className={`rounded-[28px] border p-5 ${
                moment.filmedAt
                  ? "border-white/10 bg-white/[0.03] opacity-60"
                  : "border-emerald-400/20 bg-emerald-400/10"
              }`}
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row">
                <div>
                  <div className="flex gap-2 text-sm mb-2">
                    <span>{moment.type}</span>
                    <span>Score {moment.score}</span>
                  </div>

                  <h2 className="text-2xl font-bold">
                    {formatCountryName(moment.country)}
                    {moment.opponent
                      ? ` vs ${formatCountryName(moment.opponent)}`
                      : ""}
                  </h2>

                  <p className="text-white/60 mt-2">{moment.reason}</p>

                  <div className="mt-3 text-sm text-white/50">
                    Gap: {moment.gap ? `€${moment.gap}` : "—"} | Rank:{" "}
                    {moment.rank ? `#${moment.rank}` : "—"}
                  </div>

                  <div className="mt-2 text-xs text-white/40">
                    Created: {formatDate(moment.createdAt)} | Filmed:{" "}
                    {formatDate(moment.filmedAt)}
                  </div>
                </div>

                <div className="flex min-w-[220px] flex-col gap-2">
                  <Link
                    href={`${baseUrl}/share/${moment.orderId}`}
                    target="_blank"
                    className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-black"
                  >
                    Open share page
                  </Link>

                  {!moment.filmedAt && (
                    <a
                      href={`/api/viral-moments/mark-filmed?id=${moment.id}&secret=${process.env.ADMIN_SECRET}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white/80"
                    >
                      Mark filmed
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4 p-4 bg-black/30 border border-white/10 rounded-xl">
                <pre className="text-sm whitespace-pre-wrap">
                  {buildScript(moment)}
                </pre>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}