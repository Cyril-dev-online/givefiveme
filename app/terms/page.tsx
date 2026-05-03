export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold">Terms of Service</h1>

        <p className="text-white/70">
          GiveFive is a public internet experiment. By participating, you agree
          to the following terms.
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Nature of the service</h2>
          <p className="text-white/70">
            GiveFive is not a traditional product or service. It is a voluntary
            participation in a public, real-time experiment visible online.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Participation</h2>
          <p className="text-white/70">
            Participation requires a fixed payment of €5. This payment is made
            voluntarily and grants no ownership, reward, or guaranteed outcome.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. No refund policy</h2>
          <p className="text-white/70">
            All payments are final. By participating, you acknowledge that no
            refunds, reimbursements, or chargebacks are intended or expected,
            except where required by applicable law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. No guarantees</h2>
          <p className="text-white/70">
            GiveFive does not guarantee any specific result, outcome, or
            experience. The experiment may evolve, change, or stop at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Public visibility</h2>
          <p className="text-white/70">
            Participation may be reflected publicly through aggregated data such
            as country-level statistics or map visualizations. No personal
            identity is displayed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Payments</h2>
          <p className="text-white/70">
            Payments are processed by Stripe. We do not store or handle your
            payment details directly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Limitation of liability</h2>
          <p className="text-white/70">
            To the maximum extent permitted by law, GiveFive shall not be liable
            for any indirect, incidental, or consequential damages resulting
            from participation in the experiment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Changes</h2>
          <p className="text-white/70">
            These terms may be updated at any time. Continued use of the service
            implies acceptance of the updated terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Contact</h2>
          <p className="text-white/70">
            For any questions, contact: hello@givefive.me
          </p>
        </section>
      </div>
    </main>
  )
}