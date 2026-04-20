import { motion } from "framer-motion";
import { Briefcase, Megaphone, LineChart } from "lucide-react";
import bgPillars from "@/assets/bg-pillars.jpg";

const pillars = [
  {
    icon: Briefcase,
    title: "Freelancing",
    tag: "Skill-Based",
    desc: "Learn writing, design, video editing, and data entry. Get real client leads from our partner network.",
    bullets: ["Beginner-friendly modules", "Live mentorship calls", "Portfolio reviews"],
    accent: "from-primary to-primary-glow",
  },
  {
    icon: Megaphone,
    title: "Agency Services",
    tag: "High-Ticket",
    desc: "Offer social media, web design, and content services to local businesses. We hand you the playbook.",
    bullets: ["Done-for-you proposals", "Pricing templates", "Client outreach scripts"],
    accent: "from-primary via-accent to-primary-glow",
  },
  {
    icon: LineChart,
    title: "Finance Education",
    tag: "Knowledge",
    desc: "Learn personal finance, budgeting, and basic stock-market literacy. Education only — never tips.",
    bullets: ["SEBI-aware content", "No 'sure shot' calls", "Structured roadmap"],
    accent: "from-accent via-primary to-accent-glow",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const Pillars = () => (
  <section id="pillars" className="relative py-24 sm:py-32">
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <img src={bgPillars} alt="" loading="lazy" width={1920} height={1024} className="w-full h-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/55 to-background" />
    </div>
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Four Pillars</span>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">
          Pick the path that <span className="text-gradient-aurora">fits your life</span>.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Every pillar is a real, legal income stream — not a get-rich-quick scheme. Pick one or combine them.
        </p>
      </motion.div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {pillars.map((p, i) => (
          <motion.article
            key={p.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            exit="hidden"
            viewport={{ once: false, margin: "-80px" }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-7 shadow-card transition-all hover:shadow-elegant hover:border-primary/40"
          >
            <div className={`absolute -top-20 -right-20 size-56 rounded-full bg-gradient-to-br ${p.accent} opacity-10 blur-3xl transition-opacity group-hover:opacity-25`} />

            <div className="flex items-center justify-between">
              <div className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br ${p.accent} text-primary-foreground shadow-glow`}>
                <p.icon className="size-6" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border/60 rounded-full px-2.5 py-1">
                {p.tag}
              </span>
            </div>

            <h3 className="mt-6 font-display text-2xl font-bold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>

            <ul className="mt-5 space-y-2">
              {p.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span className="text-foreground/80">{b}</span>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default Pillars;
