import { useEffect, useState, useCallback } from "react";

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  text: string;
  /** Epoch ms; null = permanent */
  expiresAt?: number | null;
};

const KEY = "nxt:testimonials:v1";
const EVENT = "nxt:testimonials-changed";

const DEFAULTS: Testimonial[] = [
  {
    id: "seed-1",
    name: "Priya K.",
    role: "Freelancing Pillar · Pune",
    text: "The portfolio review changed everything. I landed my first writing client in three weeks while still in college.",
    expiresAt: null,
  },
  {
    id: "seed-2",
    name: "Rohit M.",
    role: "Agency Pillar · Lucknow",
    text: "I now run social media for two local restaurants. The outreach scripts are gold — that's how I closed both clients.",
    expiresAt: null,
  },
  {
    id: "seed-3",
    name: "Sneha R.",
    role: "Finance Education · Indore",
    text: "I learned the basics of budgeting and SIPs in a structured way. No tips, just real knowledge that I now apply daily.",
    expiresAt: null,
  },
  {
    id: "seed-4",
    name: "Aman S.",
    role: "Freelancing Pillar · Jaipur",
    text: "Started video editing 4 hours a day after college. Within 6 weeks I had two regular YouTube clients paying weekly.",
    expiresAt: null,
  },
];

const read = (): Testimonial[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Testimonial[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

const write = (list: Testimonial[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
};

const emit = () => window.dispatchEvent(new Event(EVENT));

export function useTestimonials() {
  const [items, setItems] = useState<Testimonial[]>(() => read());

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    const tick = window.setInterval(sync, 30_000);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
      window.clearInterval(tick);
    };
  }, []);

  const add = useCallback((t: Omit<Testimonial, "id">) => {
    const list = read();
    const next: Testimonial = { ...t, id: crypto.randomUUID() };
    write([...list, next]);
    emit();
  }, []);

  const update = useCallback((id: string, patch: Partial<Testimonial>) => {
    const list = read();
    write(list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    emit();
  }, []);

  const remove = useCallback((id: string) => {
    const list = read();
    write(list.filter((t) => t.id !== id));
    emit();
  }, []);

  const reset = useCallback(() => {
    write(DEFAULTS);
    emit();
  }, []);

  const now = Date.now();
  const visible = items.filter((t) => !t.expiresAt || t.expiresAt > now);

  return { items: visible, all: items, add, update, remove, reset };
}
