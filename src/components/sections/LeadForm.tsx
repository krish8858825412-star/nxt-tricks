import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, CheckCircle2 } from "lucide-react";
import { TELEGRAM_CHANNEL_URL } from "@/lib/constants";
import bgForm from "@/assets/bg-form.jpg";

const interests = [
  "Freelancing",
  "Agency Services",
  "Finance Education",
  "Not sure yet",
];

const LeadForm = () => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    interest: "",
    message: "",
  });

  const update = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.interest) {
      toast({ title: "Missing info", description: "Name, phone and interest are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      interest: form.interest,
      message: form.message.trim() || null,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Could not submit", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    toast({ title: "Application received", description: "Now join our Telegram channel to get started." });
  };

  return (
    <section id="apply" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img src={bgForm} alt="" loading="lazy" width={1920} height={1024} className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      </div>
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Apply Now</span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">
              Take the <span className="text-gradient-aurora">first step</span> today.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md">
              Fill the form and we'll send your starter roadmap on Telegram. No fees, no spam, no commitments.
            </p>

            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Free to join — no hidden charges",
                "Beginner-friendly, mobile only",
                "Direct support from our community",
                "Earnings depend on your own effort",
              ].map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-3xl p-6 sm:p-8 shadow-elegant"
          >
            {done ? (
              <div className="text-center py-10">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-primary glow-primary">
                  <CheckCircle2 className="size-8 text-primary-foreground" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold">You're in!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We received your details. Join the Telegram channel now to receive your roadmap.
                </p>
                <Button asChild size="lg" variant="hero" className="mt-6">
                  <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                    <Send className="size-4" /> Join Telegram
                  </a>
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name *</Label>
                  <Input id="full_name" value={form.full_name} onChange={(e) => update("full_name")(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (WhatsApp) *</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone")(e.target.value)} placeholder="10-digit mobile" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => update("email")(e.target.value)} placeholder="you@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Interested in *</Label>
                  <Select value={form.interest} onValueChange={update("interest")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pillar" />
                    </SelectTrigger>
                    <SelectContent>
                      {interests.map((i) => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Anything else?</Label>
                  <Textarea id="message" rows={3} value={form.message} onChange={(e) => update("message")(e.target.value)} placeholder="Tell us your goals (optional)" />
                </div>
                <Button type="submit" size="lg" variant="hero" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : (<><Send className="size-4" /> Submit Application</>)}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">
                  By submitting you agree to be contacted on Telegram/WhatsApp. We never share your details.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LeadForm;
