import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminPassword } from "@/hooks/useAdminMode";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Download, RefreshCcw, BarChart3, Users, Globe2, Eye } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Lead = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  interest: string;
  message: string | null;
  created_at: string;
};

type Visitor = {
  id: string;
  event_type: string;
  path: string;
  ip_address: string;
  user_agent: string | null;
  referrer: string | null;
  screen: string | null;
  created_at: string;
};

type Bucket = "hour" | "day" | "month" | "year";

const formatBucket = (d: Date, bucket: Bucket) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  if (bucket === "hour") return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:00`;
  if (bucket === "day") return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (bucket === "month") return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  return `${d.getFullYear()}`;
};

const csvEscape = (v: unknown) => {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export default function AdminAnalytics() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [bucket, setBucket] = useState<Bucket>("day");
  const [source, setSource] = useState<"visitors" | "leads">("visitors");

  const fetchAll = async () => {
    setLoading(true);
    const pwd = getAdminPassword();
    const [leadsRes, visitorsRes] = await Promise.all([
      supabase.functions.invoke("admin-data", {
        body: { action: "leads" },
        headers: { "x-admin-password": pwd },
      }),
      supabase.functions.invoke("admin-data", {
        body: { action: "visitors" },
        headers: { "x-admin-password": pwd },
      }),
    ]);
    setLoading(false);
    if (leadsRes.error) {
      toast({ title: "Could not load leads", description: leadsRes.error.message, variant: "destructive" });
      return;
    }
    if (visitorsRes.error) {
      toast({ title: "Could not load visitors", description: visitorsRes.error.message, variant: "destructive" });
    }
    setLeads((leadsRes.data as { leads: Lead[] })?.leads ?? []);
    setVisitors((visitorsRes.data as { visitors: Visitor[] })?.visitors ?? []);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = useMemo(() => {
    const rows: { created_at: string }[] = source === "visitors" ? visitors : leads;
    const counts = new Map<string, number>();
    for (const r of rows) {
      const d = new Date(r.created_at);
      const k = formatBucket(d, bucket);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-30)
      .map(([label, count]) => ({ label, count }));
  }, [leads, visitors, bucket, source]);

  const interestBreakdown = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of leads) m.set(l.interest, (m.get(l.interest) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  const uniqueIps = useMemo(() => new Set(visitors.map((v) => v.ip_address)).size, [visitors]);
  const visits24h = useMemo(
    () => visitors.filter((v) => Date.now() - new Date(v.created_at).getTime() < 86_400_000).length,
    [visitors],
  );
  const repeatVisitors = useMemo(() => {
    const m = new Map<string, number>();
    for (const v of visitors) m.set(v.ip_address, (m.get(v.ip_address) ?? 0) + 1);
    return Array.from(m.entries())
      .filter(([, c]) => c > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [visitors]);

  const downloadCsv = () => {
    const headers = ["created_at", "full_name", "phone", "email", "interest", "message"];
    const rows = leads.map((l) =>
      headers.map((h) => csvEscape(l[h as keyof Lead])).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nxt-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pt-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-secondary/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="size-3.5" /> Total visits
          </div>
          <div className="mt-1 font-display text-2xl font-bold">{visitors.length}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-secondary/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe2 className="size-3.5" /> Unique IPs
          </div>
          <div className="mt-1 font-display text-2xl font-bold">{uniqueIps}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-secondary/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-3.5" /> Total leads
          </div>
          <div className="mt-1 font-display text-2xl font-bold">{leads.length}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-secondary/40 p-3">
          <div className="text-xs text-muted-foreground">Visits 24h</div>
          <div className="mt-1 font-display text-2xl font-bold">
            {visits24h}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            {source === "visitors" ? "Visitors over time" : "Leads over time"}
          </h3>
          <div className="flex items-center gap-2">
            <Select value={source} onValueChange={(v) => setSource(v as "visitors" | "leads")}>
              <SelectTrigger className="h-8 w-[110px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="visitors">Visitors</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bucket} onValueChange={(v) => setBucket(v as Bucket)}>
              <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">By hour</SelectItem>
                <SelectItem value="day">By day</SelectItem>
                <SelectItem value="month">By month</SelectItem>
                <SelectItem value="year">By year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={fetchAll} disabled={loading}>
              <RefreshCcw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <div className="h-56 w-full">
          {chartData.length === 0 ? (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">
              {loading ? "Loading…" : "No data yet"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--accent) / 0.2)" }}
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {interestBreakdown.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-medium text-muted-foreground">By interest</div>
            <ul className="space-y-1.5">
              {interestBreakdown.map(([interest, count]) => {
                const max = interestBreakdown[0][1];
                const pct = (count / max) * 100;
                return (
                  <li key={interest} className="text-xs">
                    <div className="mb-0.5 flex items-center justify-between">
                      <span>{interest}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Visitors table */}
      <div className="rounded-xl border border-border/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Globe2 className="size-4 text-primary" /> Visitors ({visitors.length})
          </h3>
        </div>

        {repeatVisitors.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-medium text-muted-foreground">Top repeat IPs</div>
            <ul className="space-y-1.5">
              {repeatVisitors.map(([ip, count]) => {
                const max = repeatVisitors[0][1];
                const pct = (count / max) * 100;
                return (
                  <li key={ip} className="text-xs">
                    <div className="mb-0.5 flex items-center justify-between">
                      <span className="font-mono">{ip}</span>
                      <span className="text-muted-foreground">{count} visits</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="max-h-[40vh] overflow-auto rounded-lg border border-border/40">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
              <tr className="text-left">
                <th className="px-2 py-1.5 font-medium">When</th>
                <th className="px-2 py-1.5 font-medium">IP</th>
                <th className="px-2 py-1.5 font-medium">Path</th>
                <th className="px-2 py-1.5 font-medium">Referrer</th>
              </tr>
            </thead>
            <tbody>
              {visitors.slice(0, 200).map((v) => (
                <tr key={v.id} className="border-t border-border/40 align-top">
                  <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">
                    {new Date(v.created_at).toLocaleString()}
                  </td>
                  <td className="px-2 py-1.5 font-mono">{v.ip_address}</td>
                  <td className="px-2 py-1.5 truncate max-w-[120px]">{v.path}</td>
                  <td className="px-2 py-1.5 truncate max-w-[120px] text-muted-foreground">
                    {v.referrer ?? "—"}
                  </td>
                </tr>
              ))}
              {visitors.length === 0 && (
                <tr><td colSpan={4} className="px-2 py-6 text-center text-muted-foreground">{loading ? "Loading…" : "No visits tracked yet"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold">All leads ({leads.length})</h3>
          <Button variant="hero" size="sm" onClick={downloadCsv} disabled={leads.length === 0}>
            <Download className="size-3.5" /> CSV
          </Button>
        </div>
        <div className="max-h-[40vh] overflow-auto rounded-lg border border-border/40">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
              <tr className="text-left">
                <th className="px-2 py-1.5 font-medium">When</th>
                <th className="px-2 py-1.5 font-medium">Name</th>
                <th className="px-2 py-1.5 font-medium">Phone</th>
                <th className="px-2 py-1.5 font-medium">Interest</th>
                <th className="px-2 py-1.5 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-border/40 align-top">
                  <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="px-2 py-1.5 font-medium">{l.full_name}</td>
                  <td className="px-2 py-1.5">{l.phone}</td>
                  <td className="px-2 py-1.5">{l.interest}</td>
                  <td className="px-2 py-1.5 text-muted-foreground max-w-[180px] truncate" title={l.message ?? ""}>
                    {l.message ?? "—"}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">{loading ? "Loading…" : "No leads yet"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}