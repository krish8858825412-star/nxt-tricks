import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChannels } from "@/hooks/useChannels";
import { useTestimonials } from "@/hooks/useTestimonials";
import { ADMIN_PASSWORD } from "@/lib/constants";
import { Lock, Plus, Save, Trash2, ShieldCheck, Clock, Infinity as InfinityIcon, RotateCcw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const SESSION_KEY = "nxt:admin-auth";

const DURATION_OPTIONS = [
  { value: "permanent", label: "Permanent" },
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "1d", label: "1 day" },
  { value: "3d", label: "3 days" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

const durationToMs = (v: string): number | null => {
  if (v === "permanent") return null;
  const n = parseInt(v, 10);
  const unit = v.replace(/^\d+/, "");
  const mul = unit === "h" ? 3600_000 : unit === "d" ? 86_400_000 : 0;
  return n * mul;
};

const formatExpiry = (ts?: number | null) => {
  if (!ts) return "Permanent";
  const remaining = ts - Date.now();
  if (remaining <= 0) return "Expired";
  const hrs = Math.floor(remaining / 3_600_000);
  if (hrs < 1) return `${Math.max(1, Math.floor(remaining / 60_000))}m left`;
  if (hrs < 48) return `${hrs}h left`;
  return `${Math.floor(hrs / 24)}d left`;
};

export default function AdminPanel({ open, onOpenChange }: Props) {
  const { mainRaw, extrasAll, updateMain, addExtra, updateExtra, removeExtra } = useChannels();
  const { all: testimonials, add: addTesti, update: updateTesti, remove: removeTesti, reset: resetTesti } = useTestimonials();

  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");

  // Channels form state
  const [mainName, setMainName] = useState(mainRaw.name);
  const [mainUrl, setMainUrl] = useState(mainRaw.url);
  const [mainDuration, setMainDuration] = useState("permanent");
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDuration, setNewDuration] = useState("permanent");

  // Testimonials form state
  const [tName, setTName] = useState("");
  const [tRole, setTRole] = useState("");
  const [tText, setTText] = useState("");
  const [tDuration, setTDuration] = useState("permanent");

  useEffect(() => {
    if (open) {
      setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
      setMainName(mainRaw.name);
      setMainUrl(mainRaw.url);
      setMainDuration("permanent");
      setPwd("");
    }
  }, [open, mainRaw.name, mainRaw.url]);

  const tryAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      toast({ title: "Welcome, admin", description: "Manage channels and testimonials." });
    } else {
      toast({ title: "Wrong password", variant: "destructive" });
    }
  };

  const saveMain = () => {
    if (!mainName.trim() || !mainUrl.trim()) {
      toast({ title: "Name and URL required", variant: "destructive" });
      return;
    }
    const ms = durationToMs(mainDuration);
    updateMain({
      name: mainName.trim(),
      url: mainUrl.trim(),
      expiresAt: ms ? Date.now() + ms : null,
    });
    toast({ title: "Main channel updated" });
  };

  const addOneChannel = () => {
    if (!newName.trim() || !newUrl.trim()) {
      toast({ title: "Name and URL required", variant: "destructive" });
      return;
    }
    const ms = durationToMs(newDuration);
    addExtra({
      name: newName.trim(),
      url: newUrl.trim(),
      expiresAt: ms ? Date.now() + ms : null,
    });
    setNewName("");
    setNewUrl("");
    setNewDuration("permanent");
    toast({ title: "Channel added" });
  };

  const setExtraDuration = (id: string, dur: string) => {
    const ms = durationToMs(dur);
    updateExtra(id, { expiresAt: ms ? Date.now() + ms : null });
    toast({ title: "Expiry updated", description: dur === "permanent" ? "Now permanent" : `Will expire in ${dur}` });
  };

  const addOneTesti = () => {
    if (!tName.trim() || !tRole.trim() || !tText.trim()) {
      toast({ title: "All fields required", variant: "destructive" });
      return;
    }
    const ms = durationToMs(tDuration);
    addTesti({
      name: tName.trim(),
      role: tRole.trim(),
      text: tText.trim(),
      expiresAt: ms ? Date.now() + ms : null,
    });
    setTName("");
    setTRole("");
    setTText("");
    setTDuration("permanent");
    toast({ title: "Testimonial added" });
  };

  const setTestiDuration = (id: string, dur: string) => {
    const ms = durationToMs(dur);
    updateTesti(id, { expiresAt: ms ? Date.now() + ms : null });
    toast({ title: "Expiry updated" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" /> Admin Panel
          </DialogTitle>
          <DialogDescription>
            Manage channels and testimonials. Anything you add here updates the live site instantly.
          </DialogDescription>
        </DialogHeader>

        {!authed ? (
          <form onSubmit={tryAuth} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="pwd" className="flex items-center gap-2">
                <Lock className="size-4" /> Admin password
              </Label>
              <Input
                id="pwd"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Enter password"
                autoFocus
              />
            </div>
            <Button type="submit" variant="hero" className="w-full">
              Unlock
            </Button>
          </form>
        ) : (
          <Tabs defaultValue="channels" className="pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            </TabsList>

            {/* CHANNELS TAB */}
            <TabsContent value="channels" className="space-y-6 pt-4">
              <section className="space-y-3 rounded-xl border border-border/60 p-4 bg-secondary/40">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  Main channel
                  <span className="text-[10px] uppercase tracking-widest rounded-full bg-background/60 border border-border/60 px-2 py-0.5 text-muted-foreground">
                    {formatExpiry(mainRaw.expiresAt)}
                  </span>
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="m-name">Name</Label>
                  <Input id="m-name" value={mainName} onChange={(e) => setMainName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-url">Telegram URL</Label>
                  <Input id="m-url" value={mainUrl} onChange={(e) => setMainUrl(e.target.value)} placeholder="https://t.me/..." />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="size-3.5" /> Duration</Label>
                  <Select value={mainDuration} onValueChange={setMainDuration}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Saving with a duration starts the countdown from now. After it expires the main channel falls back to the default.
                  </p>
                </div>
                <Button onClick={saveMain} variant="hero" size="sm">
                  <Save className="size-4" /> Save main channel
                </Button>
              </section>

              <section className="space-y-3 rounded-xl border border-border/60 p-4">
                <h3 className="font-display font-semibold">Additional channels</h3>
                {extrasAll.length === 0 && (
                  <p className="text-xs text-muted-foreground">No extra channels yet. Add one below.</p>
                )}
                <ul className="space-y-3">
                  {extrasAll.map((c) => {
                    const expired = c.expiresAt && c.expiresAt <= Date.now();
                    return (
                      <li key={c.id} className={`space-y-2 rounded-lg border p-3 ${expired ? "border-destructive/40 bg-destructive/5" : "border-border/60"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-widest rounded-full bg-secondary px-2 py-0.5 text-muted-foreground inline-flex items-center gap-1">
                            {c.expiresAt ? <Clock className="size-3" /> : <InfinityIcon className="size-3" />}
                            {formatExpiry(c.expiresAt)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExtra(c.id)}
                            className="text-destructive hover:text-destructive h-7 px-2"
                          >
                            <Trash2 className="size-3.5" /> Remove
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Name</Label>
                          <Input value={c.name} onChange={(e) => updateExtra(c.id, { name: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">URL</Label>
                          <Input value={c.url} onChange={(e) => updateExtra(c.id, { url: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Reset duration</Label>
                          <Select onValueChange={(v) => setExtraDuration(c.id, v)}>
                            <SelectTrigger><SelectValue placeholder="Change duration..." /></SelectTrigger>
                            <SelectContent>
                              {DURATION_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="space-y-2 rounded-lg bg-secondary/40 p-3">
                  <Label className="text-xs">Add new channel</Label>
                  <Input placeholder="Channel name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <Input placeholder="https://t.me/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                  <Select value={newDuration} onValueChange={setNewDuration}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addOneChannel} variant="hero" size="sm" className="w-full">
                    <Plus className="size-4" /> Add channel
                  </Button>
                </div>
              </section>
            </TabsContent>

            {/* TESTIMONIALS TAB */}
            <TabsContent value="testimonials" className="space-y-6 pt-4">
              <section className="space-y-3 rounded-xl border border-border/60 p-4 bg-secondary/40">
                <Label className="text-xs">Add testimonial</Label>
                <Input placeholder="Name (e.g. Priya K.)" value={tName} onChange={(e) => setTName(e.target.value)} />
                <Input placeholder="Role (e.g. Freelancing Pillar · Pune)" value={tRole} onChange={(e) => setTRole(e.target.value)} />
                <Textarea placeholder="What they said..." rows={3} value={tText} onChange={(e) => setTText(e.target.value)} />
                <Select value={tDuration} onValueChange={setTDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addOneTesti} variant="hero" size="sm" className="w-full">
                  <Plus className="size-4" /> Add testimonial
                </Button>
              </section>

              <section className="space-y-3 rounded-xl border border-border/60 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold">All testimonials ({testimonials.length})</h3>
                  <Button variant="ghost" size="sm" onClick={() => { resetTesti(); toast({ title: "Reset to defaults" }); }}>
                    <RotateCcw className="size-3.5" /> Reset
                  </Button>
                </div>
                {testimonials.length === 0 && (
                  <p className="text-xs text-muted-foreground">No testimonials yet.</p>
                )}
                <ul className="space-y-3">
                  {testimonials.map((t) => {
                    const expired = t.expiresAt && t.expiresAt <= Date.now();
                    return (
                      <li key={t.id} className={`space-y-2 rounded-lg border p-3 ${expired ? "border-destructive/40 bg-destructive/5" : "border-border/60"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-widest rounded-full bg-secondary px-2 py-0.5 text-muted-foreground inline-flex items-center gap-1">
                            {t.expiresAt ? <Clock className="size-3" /> : <InfinityIcon className="size-3" />}
                            {formatExpiry(t.expiresAt)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTesti(t.id)}
                            className="text-destructive hover:text-destructive h-7 px-2"
                          >
                            <Trash2 className="size-3.5" /> Remove
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Name</Label>
                          <Input value={t.name} onChange={(e) => updateTesti(t.id, { name: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Role</Label>
                          <Input value={t.role} onChange={(e) => updateTesti(t.id, { role: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Quote</Label>
                          <Textarea value={t.text} rows={3} onChange={(e) => updateTesti(t.id, { text: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Reset duration</Label>
                          <Select onValueChange={(v) => setTestiDuration(t.id, v)}>
                            <SelectTrigger><SelectValue placeholder="Change duration..." /></SelectTrigger>
                            <SelectContent>
                              {DURATION_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </TabsContent>
          </Tabs>
        )}

        {authed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sessionStorage.removeItem(SESSION_KEY);
              setAuthed(false);
            }}
            className="w-full mt-2"
          >
            Lock admin panel
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
