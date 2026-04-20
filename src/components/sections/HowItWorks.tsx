import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Send, GraduationCap, Rocket, Wallet } from "lucide-react";
import bgHow from "@/assets/poster-how.jpg";

const steps = [
  { icon: Send, title: "Join the Channel", text: "Tap the Telegram button and join our free community." },
  { icon: GraduationCap, title: "Pick Your Pillar", text: "Choose Freelancing, Agency Services, or Finance Education." },
  { icon: Rocket, title: "Follow the Roadmap", text: "Daily 2–4 hour tasks, beginner-friendly, mobile only." },
  { icon: Wallet, title: "Earn Real Income", text: "Get paid by clients, brands, or platforms — directly to you." },
];

const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 20%"] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img src={bgHow} alt="" loading="lazy" width={1920} height={1024} className="w-full h-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-accent font-medium">How It Works</span>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold">
            From <span className="text-gradient-aurora">zero to first payout</span> in 4 steps.
          </h2>
        </motion.div>

        <div ref={ref} className="relative mt-16 max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border">
            <motion.div style={{ height: lineHeight }} className="w-full bg-gradient-to-b from-primary via-accent to-primary origin-top" />
          </div>

          <div className="space-y-12">
            {steps.map((s, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-80px" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex sm:items-center gap-6 ${isLeft ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  {/* Dot */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 z-10">
                    <div className="size-4 rounded-full bg-gradient-primary glow-primary ring-4 ring-background" />
                  </div>

                  {/* Spacer for desktop */}
                  <div className="hidden sm:block sm:flex-1" />

                  {/* Card */}
                  <div className="ml-16 sm:ml-0 sm:flex-1">
                    <div className="glass rounded-2xl p-6 shadow-card">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
                          <s.icon className="size-5" />
                        </div>
                        <span className="font-display text-sm text-muted-foreground">Step {i + 1}</span>
                      </div>
                      <h3 className="mt-3 font-display text-xl font-bold">{s.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
