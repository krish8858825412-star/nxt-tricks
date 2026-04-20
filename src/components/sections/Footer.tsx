import { Send, MessageCircle } from "lucide-react";
import { OWNER_TELEGRAM, OWNER_TELEGRAM_URL, TELEGRAM_CHANNEL_URL } from "@/lib/constants";

const Footer = () => (
  <footer className="relative border-t border-border/60 py-14">
    <div className="container">
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-lg bg-gradient-aurora animate-gradient-shift bg-[length:200%_200%] grid place-items-center font-display font-bold text-primary-foreground text-sm">N</span>
            <span className="font-display font-bold tracking-tight text-lg">NST Tricks<span className="text-primary"> · </span><span className="text-muted-foreground font-normal text-sm">Official</span></span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Legitimate work-from-home opportunities for India. Built by creators, for creators.
          </p>
        </div>

        <div>
          <h4 className="font-display font-semibold">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Send className="size-4 text-primary" /> Join our Telegram channel
              </a>
            </li>
            <li>
              <a href={OWNER_TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="size-4 text-accent" /> Owner: @{OWNER_TELEGRAM}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold">Important Disclaimer</h4>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            NST Tricks (Official) is an education and community platform. We do <strong className="text-foreground">not</strong> guarantee any specific income.
            Earnings depend entirely on your own effort, skill, and consistency. We never ask for deposits to "unlock" earnings.
            Beware of any account claiming otherwise — that is a scam.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} NST Tricks (Official). All rights reserved.</p>
        <p>Made with care · Mobile-first</p>
      </div>
    </div>
  </footer>
);

export default Footer;
