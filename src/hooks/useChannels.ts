import { useEffect, useState, useCallback } from "react";
import { DEFAULT_TELEGRAM_CHANNEL_URL } from "@/lib/constants";

export type Channel = {
  id: string;
  name: string;
  url: string;
  /** Epoch ms when this channel should disappear. `null` = permanent. */
  expiresAt?: number | null;
};

const STORAGE_KEY = "nxt:channels:v1";
const MAIN_KEY = "nxt:main-channel:v1";

const DEFAULT_MAIN: Channel = {
  id: "main",
  name: "NXT Tricks · Official",
  url: DEFAULT_TELEGRAM_CHANNEL_URL,
  expiresAt: null,
};

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

const EVENT = "nxt:channels-changed";

const emit = () => window.dispatchEvent(new Event(EVENT));

export function useChannels() {
  const [main, setMain] = useState<Channel>(() => read(MAIN_KEY, DEFAULT_MAIN));
  const [extras, setExtras] = useState<Channel[]>(() => read(STORAGE_KEY, []));

  useEffect(() => {
    const sync = () => {
      setMain(read(MAIN_KEY, DEFAULT_MAIN));
      setExtras(read(STORAGE_KEY, []));
    };
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    // Re-check expiries every 30s so expired channels auto-disappear.
    const tick = window.setInterval(sync, 30_000);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
      window.clearInterval(tick);
    };
  }, []);

  const updateMain = useCallback((next: Partial<Channel>) => {
    const merged = { ...read(MAIN_KEY, DEFAULT_MAIN), ...next, id: "main" };
    write(MAIN_KEY, merged);
    emit();
  }, []);

  const addExtra = useCallback((c: Omit<Channel, "id">) => {
    const list = read<Channel[]>(STORAGE_KEY, []);
    const next: Channel = { ...c, id: crypto.randomUUID() };
    write(STORAGE_KEY, [...list, next]);
    emit();
  }, []);

  const updateExtra = useCallback((id: string, patch: Partial<Channel>) => {
    const list = read<Channel[]>(STORAGE_KEY, []);
    write(STORAGE_KEY, list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    emit();
  }, []);

  const removeExtra = useCallback((id: string) => {
    const list = read<Channel[]>(STORAGE_KEY, []);
    write(STORAGE_KEY, list.filter((c) => c.id !== id));
    emit();
  }, []);

  // Filter out expired extras for public consumption. Admin panel uses
  // `extrasAll` so it can still see/edit expired ones if desired.
  const now = Date.now();
  const visibleExtras = extras.filter(
    (c) => !c.expiresAt || c.expiresAt > now,
  );
  const visibleMain =
    main.expiresAt && main.expiresAt <= now ? DEFAULT_MAIN : main;

  return {
    main: visibleMain,
    mainRaw: main,
    extras: visibleExtras,
    extrasAll: extras,
    updateMain,
    addExtra,
    updateExtra,
    removeExtra,
  };
}
