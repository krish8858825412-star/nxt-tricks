import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { useChannels } from "@/hooks/useChannels";

const headline = "NXT Tricks · Official";

const letterVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.2 + i * 0.03, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const Hero = () => {
  const reduce = useReducedMotion();
  const { main, extras } = useChannels();
  const posterIntro = reduce
    ? {
        hidden: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" },
        show: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" },
      }
    : {
        hidden: { opacity: 0, x: -80, y: 90, scale: 0.8, rotate: -8, filter: "blur(18px)" },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotate: 0,
          filter: "blur(0px)",
          transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1] as const },
        },
      };

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden pt-28 sm:pt-32 pb-20">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img src={heroBg} alt="NST Tricks Official poster" width={1920} height={1280} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />
        <div className="absolute inset-0 grid-pattern opacity-50" />
      </div>

      {/* Floating orbs */}
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-32 left-[10%] size-40 rounded-full bg-primary/30 blur-3xl"
          />
          <motion.div
            aria-hidden
            animate={{ y: [0, 30, 0], x: [0, -25, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-[8%] size-56 rounded-full bg-accent/30 blur-3xl"
          />
        </>
      )}

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-fit"
        >
          <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span>India's #1 legitimate work-from-home community</span>
          </div>
        </motion.div>

        <motion.div
          variants={posterIntro}
          initial="hidden"
          animate="show"
          className="mx-auto mt-8 w-full max-w-[22rem] sm:max-w-md lg:max-w-xl"
        >
          <div className="glass relative overflow-hidden rounded-[2rem] border border-border/70 p-2 shadow-elegant">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
              <img
                src={heroBg}
                alt="NXT Tricks Official poster"
                width={1200}
                height={1500}
                className="h-full w-full object-cover object-center scale-[1.08]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute left-4 top-4 inline-flex items-center rounded-full border border-border/60 bg-background/45 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-foreground/90 backdrop-blur-md">
                NXT Tricks
              </div>
              <div className="absolute right-4 top-4 inline-flex items-center rounded-full border border-border/60 bg-background/45 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-primary backdrop-blur-md">
                Official
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[1.4rem] border border-border/60 bg-background/45 p-4 text-left backdrop-blur-xl"
                >
                  <p className="text-[10px] uppercase tracking-[0.35em] text-primary">Work • Learn • Earn</p>
                  <p className="mt-2 font-display text-xl font-bold leading-tight text-foreground sm:text-2xl">
                    Cinematic poster intro with a cleaner first impression.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Open the site and the poster now slides in, settles, and reveals the page more smoothly.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <h1 className="mt-6 mx-auto max-w-4xl text-center font-display font-bold tracking-tight text-4xl sm:text-6xl md:text-7xl leading-[1.05]">
          <span className="block" aria-label={headline}>
            {headline.split("").map((ch, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={letterVariants}
                initial="hidden"
                animate="show"
                className="inline-block"
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
          </span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.7 }}
            className="block mt-2 text-gradient-aurora bg-[length:200%_200%] animate-gradient-shift"
          >
            Earn ₹1,000 – ₹2,000 / day*
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="mx-auto mt-6 max-w-2xl text-center text-base sm:text-lg text-muted-foreground"
        >
          Work just 2 – 4 hours a day from your phone. Pick your skill — freelancing, agency services,
          or finance education — and grow with our guided Telegram community.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button asChild size="xl" variant="hero" className="group [touch-action:manipulation]">
            <a href={main.url} target="_blank" rel="noopener noreferrer">
              <Send className="size-5" />
              Join Telegram Channel
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          <Button asChild size="xl" variant="ghostBorder">
            <a href="#pillars">See What's Inside</a>
          </Button>
        </motion.div>

        {extras.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-xs text-muted-foreground">More channels:</span>
            {extras.map((c) => (
              <Button key={c.id} asChild size="sm" variant="ghostBorder" className="rounded-full">
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  <Send className="size-3.5" /> {c.name}
                </a>
              </Button>
            ))}
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.7 }}
          className="mt-6 text-center text-xs text-muted-foreground/70"
        >
          *Earnings depend on your effort, skill, and consistency. No income is guaranteed.
        </motion.p>
      </div>
    </section>
  );
};

export default Hero;
