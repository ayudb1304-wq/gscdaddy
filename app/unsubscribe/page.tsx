import type { Metadata } from "next"
import Link from "next/link"
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Email preferences",
  robots: { index: false, follow: false },
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; t?: string; done?: string }>
}) {
  const { u = "", t = "", done } = await searchParams
  const valid = verifyUnsubscribeToken(u, t)
  const action = `/api/unsubscribe?${new URLSearchParams({ u, t })}`

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h1 className="font-heading text-2xl font-semibold">Email preferences</h1>

        {!valid ? (
          <p className="mt-3 text-muted-foreground">
            This unsubscribe link isn&apos;t valid. Use the link from your most recent email, or{" "}
            <Link href="/login" className="underline">log in</Link> and contact us.
          </p>
        ) : done === "unsubscribed" ? (
          <>
            <p className="mt-3 text-muted-foreground">You&apos;re unsubscribed. We won&apos;t send you any more emails.</p>
            <form action={action} method="post" className="mt-6">
              <input type="hidden" name="from" value="page" />
              <input type="hidden" name="resubscribe" value="1" />
              <Button type="submit" variant="outline">Changed your mind? Resubscribe</Button>
            </form>
          </>
        ) : done === "resubscribed" ? (
          <p className="mt-3 text-muted-foreground">You&apos;re subscribed again. Welcome back.</p>
        ) : (
          <>
            <p className="mt-3 text-muted-foreground">
              Stop weekly summaries, trial reminders and tips from GSCdaddy?
            </p>
            <form action={action} method="post" className="mt-6">
              <input type="hidden" name="from" value="page" />
              <Button type="submit">Unsubscribe</Button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
