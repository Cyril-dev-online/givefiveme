export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold">Privacy</h1>

        <p className="text-white/70">
          GiveFive is a public internet experiment. We collect minimal data
          required to operate the experience.
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What we collect</h2>
          <ul className="list-disc list-inside text-white/70 space-y-1">
            <li>Country (estimated from your IP address)</li>
            <li>Approximate location (low precision latitude/longitude)</li>
            <li>Payment information (handled securely by Stripe)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How we use it</h2>
          <ul className="list-disc list-inside text-white/70 space-y-1">
            <li>Display a live global map</li>
            <li>Compute country rankings</li>
            <li>Show real-time experiment statistics</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Legal basis</h2>
          <p className="text-white/70">
            We process approximate location data based on our legitimate
            interest to operate and display a real-time public experiment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Important</h2>
          <ul className="list-disc list-inside text-white/70 space-y-1">
            <li>No precise GPS location is collected</li>
            <li>No personal identification is performed</li>
            <li>No tracking or advertising profiling</li>
            <li>No IP addresses are stored</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Payments</h2>
          <p className="text-white/70">
            Payments are processed by Stripe. We do not store your payment
            details.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Data retention</h2>
          <p className="text-white/70">
            We retain data only as long as necessary to operate the experiment
            and display aggregated statistics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Your rights</h2>
          <p className="text-white/70">
            You may request access, correction or deletion of your data at any
            time by contacting us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Data controller</h2>
          <p className="text-white/70">
            GiveFive.me
            <br />
            hello@givefive.me
          </p>
        </section>
      </div>
    </main>
  )
}