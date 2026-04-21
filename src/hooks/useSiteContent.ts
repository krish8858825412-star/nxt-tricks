import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminPassword } from "./useAdminMode";

type ContentMap = Record<string, string>;

let cache: ContentMap = {};
let loaded = false;
const listeners = new Set<(m: ContentMap) => void>();
const pending = new Set<string>();

const emit = () => listeners.forEach((l) => l({ ...cache }));

const load = async () => {
  const { data, error } = await supabase.from("site_content").select("key, value");
  if (error || !data) return;
  cache = data.reduce<ContentMap>((acc, r) => {
    acc[r.key] = r.value;
    return acc;
  }, {});
  loaded = true;
  emit();
};

let realtimeSubscribed = false;
const subscribeRealtime = () => {
  if (realtimeSubscribed) return;
  realtimeSubscribed = true;
  supabase
    .channel("site_content_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "site_content" },
      (payload) => {
        const row = (payload.new ?? payload.old) as { key?: string; value?: string };
        if (!row?.key) return;
        if (payload.eventType === "DELETE") {
          delete cache[row.key];
        } else {
          cache[row.key] = row.value ?? "";
        }
        emit();
      },
    )
    .subscribe();
};

export function useSiteContent(key: string, fallback: string) {
  const [value, setValue] = useState<string>(() => cache[key] ?? fallback);

  useEffect(() => {
    const listener = (m: ContentMap) => {
      setValue(m[key] ?? fallback);
    };
    listeners.add(listener);
    if (!loaded && !pending.has("__all__")) {
      pending.add("__all__");
      load();
    }
    subscribeRealtime();
    listener(cache);
    return () => {
      listeners.delete(listener);
    };
  }, [key, fallback]);

  const save = useCallback(
    async (next: string) => {
      // optimistic
      cache[key] = next;
      emit();
      const pwd = getAdminPassword();
      const { error } = await supabase.functions.invoke("admin-data", {
        body: { action: "set_content", key, value: next },
        headers: { "x-admin-password": pwd },
      });
      if (error) throw error;
    },
    [key],
  );

  return { value, save };
}