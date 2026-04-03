import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Terms of Service - GSCdaddy",
}

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>

      <h1 className="font-heading text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 3, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Agreement to Terms</h2>
          <p className="mt-2">
            By accessing or using GSCdaddy (&quot;the Service&quot;), operated at gscdaddy.com, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
          <p className="mt-2">
            GSCdaddy is a Google Search Console analytics tool that helps you identify ranking opportunities and provides AI-powered recommendations to improve your organic search traffic. The Service connects to your Google Search Console via read-only API access.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Account Registration</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>You must sign in with a valid Google account to use the Service.</li>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>You must provide accurate and complete information.</li>
            <li>You may not use the Service for any illegal or unauthorized purpose.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Free Trial</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>New users receive a 14-day free trial with access to core features.</li>
            <li>No credit card is required to start a trial.</li>
            <li>After the trial period, you may subscribe to a paid plan to continue using the Service, or your access will be limited to read-only.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Subscriptions and Payments</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Paid plans are billed monthly or annually, as selected at checkout.</li>
            <li>Payments are processed securely by Dodo Payments.</li>
            <li>Prices are in USD and may be updated with 30 days notice.</li>
            <li><strong>Upgrades:</strong> When upgrading your plan, you will be charged a prorated amount immediately.</li>
            <li><strong>Downgrades:</strong> When downgrading, the change takes effect at your next billing date. You retain your current plan features until then.</li>
            <li><strong>Cancellation:</strong> You can cancel your subscription at any time from your billing settings. Your access continues until the end of the current billing period.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Refund Policy</h2>
          <p className="mt-2">
            We offer a 30-day money-back guarantee. If you are not satisfied with the Service within 30 days of your first payment, contact us for a full refund. Refunds after 30 days are handled on a case-by-case basis.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Plan Limits</h2>
          <p className="mt-2">
            Each plan has limits on the number of sites and daily AI recommendations. These limits are enforced automatically. If you exceed your plan limits, you will need to upgrade to continue using those features. Current plan details are available on our pricing page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Acceptable Use</h2>
          <p className="mt-2">You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Abuse the Service by making excessive API calls or automated requests.</li>
            <li>Attempt to access other users&apos; data or accounts.</li>
            <li>Reverse engineer, decompile, or disassemble the Service.</li>
            <li>Use the Service to violate any applicable law or regulation.</li>
            <li>Resell or redistribute the Service without permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. AI-Generated Content</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>AI recommendations are generated using third-party AI models (Anthropic Claude) and are provided as suggestions only.</li>
            <li>We do not guarantee the accuracy, completeness, or effectiveness of AI-generated recommendations.</li>
            <li>You are solely responsible for any actions you take based on AI recommendations.</li>
            <li>AI recommendations should not be considered professional SEO advice.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Data and Google Search Console</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>We access your Google Search Console data in read-only mode. We cannot and do not modify your Search Console settings or data.</li>
            <li>Data accuracy depends on Google Search Console. We are not responsible for inaccuracies in the underlying data.</li>
            <li>You can revoke our access to your Google Search Console at any time through your Google Account settings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">11. Service Availability</h2>
          <p className="mt-2">
            We strive for high availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable for maintenance, updates, or circumstances beyond our control. We are not liable for any loss resulting from Service downtime.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">12. Limitation of Liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, GSCdaddy and its operator shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">13. Changes to Terms</h2>
          <p className="mt-2">
            We may update these Terms from time to time. We will notify you of material changes via email or a prominent notice on the Service. Continued use after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">14. Termination</h2>
          <p className="mt-2">
            We reserve the right to suspend or terminate your account if you violate these Terms. You may delete your account at any time. Upon termination, your data will be deleted in accordance with our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">15. Contact</h2>
          <p className="mt-2">
            For questions about these Terms, contact us at{" "}
            <a href="mailto:support@gscdaddy.com" className="text-primary hover:underline">
              support@gscdaddy.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
