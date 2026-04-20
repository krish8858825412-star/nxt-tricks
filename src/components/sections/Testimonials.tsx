import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const items = [
  {
    name: "Aarav S.",
    role: "Affiliate Pillar · Jaipur",
    text: "I started promoting Meesho links part-time. After two months I'm consistently making side income. The campaign drops save me hours.",
  },
  {
    name: "Priya K.",
    role: "Freelancing Pillar · Pune",
    text: "The portfolio review changed everything. I landed my first writing client in three weeks while still in college.",
  },
  {
    name: "Rohit M.",
    role: "Agency Pillar · Lucknow",
    text: "I now run social media for two local restaurants. The outreach scripts are gold — that's how I closed both clients.",
  },
];

const Testimonials = () => (
  <section className="relative py-24 sm:py-32">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Members</span>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold">
          Real stories. <span className="text-gradient-aurora">Real effort.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Names changed for privacy. Income depends on individual effort and consistency.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {items.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 40, rotate: i % 2 ? 1 : -1 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            className="glass rounded-2xl p-6 shadow-card"
          >
            <Quote className="size-7 text-primary/70" />
            <blockquote className="mt-4 text-foreground/90 text-sm leading-relaxed">"{t.text}"</blockquote>
            <figcaption className="mt-6 pt-4 border-t border-border/60">
              <div className="font-display font-semibold">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.role}</div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
