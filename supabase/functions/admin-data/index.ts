import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
};

const ADMIN_PASSWORD = "nxt2025";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: { action?: string; key?: string; value?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* GET-style */
  }

  const action = body.action ?? new URL(req.url).searchParams.get("action") ?? "leads";

  // Public action: track a visitor event (anyone can call, IP captured server-side)
  if (action === "track_visit") {
    const ipHeader =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-real-ip") ??
      "";
    const ip = ipHeader.split(",")[0].trim() || "unknown";
    const ua = req.headers.get("user-agent") ?? null;
    const path = String((body as { path?: string }).path ?? "/").slice(0, 500);
    const referrer = (body as { referrer?: string | null }).referrer
      ? String((body as { referrer?: string | null }).referrer).slice(0, 500)
      : null;
    const screen = (body as { screen?: string | null }).screen
      ? String((body as { screen?: string | null }).screen).slice(0, 50)
      : null;

    const { error } = await supabase.from("visitor_events").insert({
      event_type: "page_view",
      path,
      ip_address: ip,
      user_agent: ua,
      referrer,
      screen,
    });
    if (error) return json(500, { error: error.message });
    return json(200, { ok: true });
  }

  // All actions below require admin password.
  const pwd = req.headers.get("x-admin-password") ?? "";
  if (pwd !== ADMIN_PASSWORD) {
    return json(401, { error: "Unauthorized" });
  }

  if (action === "leads") {
    const { data, error } = await supabase
      .from("leads")
      .select("id, full_name, phone, email, interest, message, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) return json(500, { error: error.message });
    return json(200, { leads: data });
  }

  if (action === "visitors") {
    const { data, error } = await supabase
      .from("visitor_events")
      .select("id, event_type, path, ip_address, user_agent, referrer, screen, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) return json(500, { error: error.message });
    return json(200, { visitors: data });
  }

  if (action === "set_content") {
    const key = (body.key ?? "").trim();
    const value = body.value ?? "";
    if (!key || key.length > 200) return json(400, { error: "Invalid key" });
    if (typeof value !== "string" || value.length > 5000)
      return json(400, { error: "Invalid value" });

    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value }, { onConflict: "key" });
    if (error) return json(500, { error: error.message });
    return json(200, { ok: true });
  }

  return json(400, { error: "Unknown action" });
});