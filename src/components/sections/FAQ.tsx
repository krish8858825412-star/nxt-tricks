import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Is NXT Tricks really free to join?",
    a: "Yes. Joining the Telegram channel and the starter roadmap is 100% free. We never ask for deposits, joining fees, or any payment to 'unlock' earnings. If anyone messages you asking for money in our name, that is a scam — please report it.",
  },
  {
    q: "How much can I realistically earn?",
    a: "Members typically earn ₹1,000–₹2,000 per day after they finish the roadmap and put in 2–4 hours daily for 4–8 weeks. Some earn more, some less. Income depends on your consistency, the pillar you choose, and how well you apply the playbook. We do not guarantee any specific income.",
  },
  {
    q: "Do I need a laptop or any prior experience?",
    a: "No. The entire NXT Tricks system is built mobile-first — a phone with a stable internet connection is enough. No prior freelancing, design, or finance experience is required. We start from absolute zero.",
  },
  {
    q: "How much time do I need to spend per day?",
    a: "Plan for 2–4 focused hours per day. Many members fit this around college, a 9–5 job, or household work. Consistency matters more than total hours.",
  },
  {
    q: "Which pillar should I pick — Freelancing, Agency, or Finance?",
    a: "Freelancing is best if you want to learn a skill and get paid by clients. Agency is best if you enjoy talking to local businesses and selling done-for-you services. Finance Education is for people who want to learn money management and basic markets — it's knowledge, not income tips. You can also combine pillars.",
  },
  {
    q: "Is the Finance Education pillar a stock-tip channel?",
    a: "Absolutely not. We are SEBI-aware. We teach personal finance, budgeting, SIPs, and basic market literacy as education. We never give 'sure shot' calls or guaranteed-return tips.",
  },
  {
    q: "How do I get paid?",
    a: "Payments come directly from your clients, brands, or platforms — UPI, bank transfer, or platform wallets. NXT Tricks never holds your money or takes a cut.",
  },
  {
    q: "Can I leave the channel any time?",
    a: "Yes, instantly. There are no contracts, no lock-ins, and no cancellation charges.",
  },
];

const FAQ = () => (
  <section id="faq" className="relative py-24 sm:py-32">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl"
      >
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary font-medium">
          <HelpCircle className="size-3.5" /> Questions, answered
        </span>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">
          Everything you want to <span className="text-gradient-aurora">ask first</span>.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Honest answers. No marketing fluff. If something is missing, ask in the channel.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-12 mx-auto max-w-3xl glass rounded-3xl p-4 sm:p-6 shadow-card"
      >
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-border/60">
              <AccordionTrigger className="text-left font-display text-base sm:text-lg">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
);

export default FAQ;
