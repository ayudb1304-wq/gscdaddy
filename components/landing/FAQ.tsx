import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FAQ_ITEMS } from "@/lib/constants"
import { FadeInSection } from "./FadeInSection"

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <FadeInSection>
          <div className="text-center">
            <p className="mb-4 text-sm font-medium tracking-wider text-primary uppercase">
              FAQ
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-[40px] md:leading-[1.2]">
              Got questions? I&apos;ve got answers.
            </h2>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion type="single" collapsible className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-border bg-card px-6"
                >
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
