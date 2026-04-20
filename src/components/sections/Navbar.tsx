import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useChannels } from "@/hooks/useChannels";
import { useLongPress } from "@/hooks/useLongPress";
import AdminPanel from "@/components/admin/AdminPanel";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { label: "Pillars", href: "#pillars" },
  { label: "How It Works", href: "#how" },
  { label: "Earnings", href: "#earnings" },
  { label: "Apply", href: "#apply" },
];

const Navbar = () => {
  const { main, extras } = useChannels();
  const [adminOpen, setAdminOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const { handlers } = useLongPress({
    ms: 10000,
    onTrigger: () => setAdminOpen(true),
    onProgress: setProgress,
  });

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="container">
          <div className="mt-4 glass rounded-full px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <a href="#top" className="flex items-center gap-2 group min-w-0">
              <span className="size-8 shrink-0 rounded-lg bg-gradient-aurora animate-gradient-shift bg-[length:200%_200%] grid place-items-center font-display font-bold text-primary-foreground text-sm">
                N
              </span>
              <span className="font-display font-bold tracking-tight text-base sm:text-lg truncate">
                NXT Tricks<span className="text-primary"> · </span>
                <span className="text-muted-foreground font-normal text-xs sm:text-sm">Official</span>
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="hover:text-foreground transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <ThemeToggle className="rounded-full" />

              {/* Hidden extra channel buttons (visible on md+) */}
              {extras.slice(0, 2).map((c) => (
                <Button key={c.id} asChild size="sm" variant="ghostBorder" className="hidden lg:inline-flex rounded-full">
                  <a href={c.url} target="_blank" rel="noopener noreferrer">
                    {c.name}
                  </a>
                </Button>
              ))}

              <div className="relative">
                <Button asChild size="sm" variant="hero" className="rounded-full select-none">
                  <a
                    href={main.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...handlers}
                    aria-label={`Join ${main.name}. Long-press 10 seconds for admin.`}
                  >
                    Join Channel
                  </a>
                </Button>
                {progress > 0 && progress < 1 && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-primary/80"
                    style={{ width: `${Math.round(progress * 100)}%`, maxWidth: "90%" }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <AdminPanel open={adminOpen} onOpenChange={setAdminOpen} />
    </>
  );
};

export default Navbar;
