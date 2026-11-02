import { SiteNav } from "@/components/marketing/site-nav"
import { SiteFooter } from "@/components/marketing/site-footer"

/** Shared chrome for public pages: blog, free tools, health checker and legal pages. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNav />
      <main className="flex-1 pt-20 md:pt-24">{children}</main>
      <div className="mt-12 md:mt-16">
        <SiteFooter />
      </div>
    </div>
  )
}
