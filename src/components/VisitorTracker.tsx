import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY_PREFIX = "nxt:visit:";
const TTL_MS = 30 * 60 * 1000;

export default function VisitorTracker() {
  useEffect(() => {
    const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const key = `${KEY_PREFIX}${path}`;

    try {
      const last = Number(sessionStorage.getItem(key) || "0");
      if (Date.now() - last < TTL_MS) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch {
      /* ignore */
    }

    void supabase.functions.invoke("admin-data", {
      body: {
        action: "track_visit",
        path,
        referrer: document.referrer || null,
        screen: `${window.innerWidth}x${window.innerHeight}`,
      },
    });
  }, []);

  return null;
}