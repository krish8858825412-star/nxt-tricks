import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const KEY = "nxt:preloader:seen:v1";

/**
 * Cinematic preloader: shows once per browser session-ish (24h),
 * then fades out and reveals the page with a fullscreen scale-down
 * of the brand panel.
 */
export default function Preloader() {
  const [active, setActive] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const last = Number(localStorage.getItem(KEY) || "0");
      return Date.now() - last > 24 * 60 * 60 * 1000;
    } catch {
      return true;
    }
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const total = 2200;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / total);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(step);
      else {
        try {
          localStorage.setItem(KEY, String(Date.now()));
        } catch { /* ignore */ }
        setTimeout(() => setActive(false), 350);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[100] grid place-items-center bg-background"
          aria-hidden
        >
          {/* Aurora gradient glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 -z-10"
            style={{ background: "var(--gradient-hero)" }}
          />
          <div className="absolute inset-0 grid-pattern opacity-40" />

          {/* Center brand */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, filter: "blur(20px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 1.4, opacity: 0, filter: "blur(14px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="relative size-24 rounded-3xl bg-gradient-aurora animate-gradient-shift bg-[length:300%_300%] grid place-items-center shadow-elegant"
            >
              <span className="font-display font-bold text-primary-foreground text-4xl">N</span>
              <motion.span
                aria-hidden
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-3xl border border-primary/40"
              />
            </motion.div>

            <div className="text-center">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight"
              >
                NXT Tricks <span className="text-primary">·</span>{" "}
                <span className="text-muted-foreground font-normal">Official</span>
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-2 text-xs uppercase tracking-[0.4em] text-muted-foreground"
              >
                Work · Learn · Earn
              </motion.p>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-[3px] w-56 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full bg-gradient-aurora bg-[length:200%_200%] animate-gradient-shift"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {progress < 0.4 ? "Loading poster" : progress < 0.8 ? "Warming aurora" : "Almost there"}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
