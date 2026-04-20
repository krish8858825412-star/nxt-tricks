import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import bgTestimonials from "@/assets/poster-testimonials.jpg";
import { useTestimonials } from "@/hooks/useTestimonials";

const Testimonials = () => {
  const { items } = useTestimonials();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img src={bgTestimonials} alt="" loading="lazy" width={1920} height={1024} className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      </div>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
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

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-60px" }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
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
};

export default Testimonials;
