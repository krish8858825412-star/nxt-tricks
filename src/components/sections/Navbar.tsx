import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TELEGRAM_CHANNEL_URL } from "@/lib/constants";

const links = [
  { label: "Pillars", href: "#pillars" },
  { label: "How It Works", href: "#how" },
  { label: "Earnings", href: "#earnings" },
  { label: "Apply", href: "#apply" },
];

const Navbar = () => (
  <motion.header
    initial={{ y: -40, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    className="fixed top-0 left-0 right-0 z-50"
  >
    <div className="container">
      <div className="mt-4 glass rounded-full px-4 sm:px-6 py-3 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group">
          <span className="size-8 rounded-lg bg-gradient-aurora animate-gradient-shift bg-[length:200%_200%] grid place-items-center font-display font-bold text-primary-foreground">W</span>
          <span className="font-display font-bold tracking-tight text-base sm:text-lg">WorkHub<span className="text-primary">.</span>India</span>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full">
              {l.label}
            </a>
          ))}
        </nav>
        <Button asChild size="sm" variant="hero" className="rounded-full">
          <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noopener noreferrer">Join Channel</a>
        </Button>
      </div>
    </div>
  </motion.header>
);

export default Navbar;
