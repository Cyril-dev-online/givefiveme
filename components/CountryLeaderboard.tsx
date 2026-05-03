type CountryItem = {
  country: string
  totalAmount: number
  donations: number
}

type Props = {
  countries: CountryItem[]
}

export function CountryLeaderboard({ countries }: Props) {
  return (
    <section className="rounded-3xl border p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Top Countries</h2>
        <span className="text-sm text-zinc-500">Live ranking</span>
      </div>

      <div className="space-y-3">
        {countries.slice(0, 10).map((item, index) => (
          <div
            key={`${item.country}-${index}`}
            className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3"
          >
            <div>
              <div className="font-medium">
                #{index + 1} {item.country}
              </div>
              <div className="text-sm text-zinc-500">
                {item.donations} participants
              </div>
            </div>

            <div className="text-right font-semibold">
              €{item.totalAmount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}