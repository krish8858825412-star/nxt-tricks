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

  const pwd = req.headers.get("x-admin-password") ?? "";
  if (pwd !== ADMIN_PASSWORD) {
    return json(401, { error: "Unauthorized" });
  }

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

  if (action === "leads") {
    const { data, error } = await supabase
      .from("leads")
      .select("id, full_name, phone, email, interest, message, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) return json(500, { error: error.message });
    return json(200, { leads: data });
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