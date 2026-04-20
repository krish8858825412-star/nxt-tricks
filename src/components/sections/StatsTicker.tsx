import { motion } from "framer-motion";

const stats = [
  { v: "12,400+", l: "Members in community" },
  { v: "4", l: "Income pillars" },
  { v: "2–4 hrs", l: "Daily commitment" },
  { v: "₹0", l: "Joining fee — free" },
  { v: "100%", l: "Mobile friendly" },
  { v: "0", l: "Hidden charges" },
];

const StatsTicker = () => (
  <section id="earnings" className="relative py-20 border-y border-border/60 bg-secondary/40">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.5 }}
            className="text-center"
          >
            <div className="font-display text-2xl sm:text-3xl font-bold text-gradient-aurora bg-[length:200%_200%] animate-gradient-shift">
              {s.v}
            </div>
            <div className="mt-1 text-xs sm:text-sm text-muted-foreground">{s.l}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Brand strip */}
      <div className="mt-16 overflow-hidden">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
          Built around legitimate platforms our members work with
        </p>
        <div className="relative">
          <div className="flex w-max animate-ticker gap-12 text-muted-foreground/60">
            {[...Array(2)].flatMap((_, k) =>
              ["Amazon Affiliates", "Meesho", "CashKaro", "Upwork", "Fiverr", "Razorpay", "Google Ads", "Canva Pro", "Notion", "WhatsApp Business"].map(
                (b) => (
                  <span key={`${k}-${b}`} className="font-display font-medium whitespace-nowrap text-lg">
                    {b}
                  </span>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default StatsTicker;
