"use client"

type Props = {
  totalAmount: number
  goalAmount: number
  countryCount: number
}

export function ExperimentHero({
  totalAmount,
  goalAmount,
  countryCount,
}: Props) {
  const progress = Math.min((totalAmount / goalAmount) * 100, 100)

  return (
    <section className="mx-auto max-w-3xl text-center">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
        The $5 Internet Experiment
      </p>

      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Give €5.
        <br />
        Watch the map change.
      </h1>

      <p className="mt-4 text-lg text-zinc-600">
        A global internet experiment. No rewards. No promises. Just one visible
        collective movement in real time.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border p-5">
          <div className="text-3xl font-bold">€{totalAmount.toLocaleString()}</div>
          <div className="mt-1 text-sm text-zinc-500">raised</div>
        </div>

        <div className="rounded-2xl border p-5">
          <div className="text-3xl font-bold">{countryCount}</div>
          <div className="mt-1 text-sm text-zinc-500">countries joined</div>
        </div>

        <div className="rounded-2xl border p-5">
          <div className="text-3xl font-bold">€{goalAmount.toLocaleString()}</div>
          <div className="mt-1 text-sm text-zinc-500">global goal</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm text-zinc-500">
          <span>Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-black transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-8">
        <form action="/api/checkout" method="POST">
          <button className="rounded-2xl bg-black px-6 py-4 text-lg font-semibold text-white hover:opacity-90">
            Join the experiment — €5
          </button>
        </form>
      </div>
    </section>
  )
}