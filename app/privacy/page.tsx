import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Privacy Policy - GSCdaddy",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>

      <h1 className="font-heading text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 3, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
          <p className="mt-2">
            GSCdaddy (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates gscdaddy.com. This Privacy Policy explains how we collect, use, and protect your personal information when you use our service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
          <p className="mt-2">When you use GSCdaddy, we collect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Account information:</strong> Your name, email address, and profile picture from your Google account.</li>
            <li><strong>Google Search Console data:</strong> Read-only access to your search performance data including queries, pages, clicks, impressions, and positions. We never modify your Search Console data.</li>
            <li><strong>Usage data:</strong> How you interact with our service, including pages visited and features used.</li>
            <li><strong>Payment information:</strong> Billing details are processed by our payment provider (Dodo Payments). We do not store your credit card information.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>To provide and maintain our service, including displaying your Search Console analytics and generating AI-powered recommendations.</li>
            <li>To process your subscription and payments.</li>
            <li>To send you service-related emails (weekly summaries, alerts, account notifications).</li>
            <li>To improve our service and develop new features.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Data Storage and Security</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Your data is stored on Supabase (PostgreSQL) with row-level security enabled.</li>
            <li>Google OAuth tokens are encrypted at rest using AES-256-GCM encryption.</li>
            <li>All connections use HTTPS/TLS encryption in transit.</li>
            <li>We do not sell, rent, or share your personal data with third parties for marketing purposes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Third-Party Services</h2>
          <p className="mt-2">We use the following third-party services:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Google:</strong> OAuth authentication and Search Console API access.</li>
            <li><strong>Supabase:</strong> Database and authentication infrastructure.</li>
            <li><strong>Anthropic (Claude):</strong> AI-powered recommendation generation. Your search data is sent to generate recommendations but is not stored by Anthropic.</li>
            <li><strong>Dodo Payments:</strong> Payment processing.</li>
            <li><strong>Vercel:</strong> Application hosting.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Google API Scopes</h2>
          <p className="mt-2">
            We request the following Google OAuth scopes:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><code className="rounded bg-muted px-1 py-0.5 text-xs">email</code> and <code className="rounded bg-muted px-1 py-0.5 text-xs">profile</code> — to identify your account.</li>
            <li><code className="rounded bg-muted px-1 py-0.5 text-xs">webmasters.readonly</code> — read-only access to your Search Console data. We cannot and do not modify anything in your Google Search Console.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Data Retention and Deletion</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>We retain your Search Console data for as long as your account is active.</li>
            <li>You can disconnect your Google account and delete your data at any time from the Settings page.</li>
            <li>Upon account deletion, all your data (including synced Search Console data, recommendations, and account information) is permanently deleted within 30 days.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Your Rights</h2>
          <p className="mt-2">You have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Access and export your data.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your account and data.</li>
            <li>Revoke Google Search Console access at any time through your Google Account settings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Cookies</h2>
          <p className="mt-2">
            We use essential cookies for authentication and session management. We do not use tracking cookies or third-party advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on our website.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">11. Contact</h2>
          <p className="mt-2">
            If you have questions about this Privacy Policy, contact us at{" "}
            <a href="mailto:privacy@gscdaddy.com" className="text-primary hover:underline">
              privacy@gscdaddy.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
