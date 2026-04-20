import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useChannels } from "@/hooks/useChannels";
import { ADMIN_PASSWORD } from "@/lib/constants";
import { Lock, Plus, Save, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const SESSION_KEY = "nxt:admin-auth";

export default function AdminPanel({ open, onOpenChange }: Props) {
  const { main, extras, updateMain, addExtra, updateExtra, removeExtra } = useChannels();
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");

  const [mainName, setMainName] = useState(main.name);
  const [mainUrl, setMainUrl] = useState(main.url);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    if (open) {
      setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
      setMainName(main.name);
      setMainUrl(main.url);
      setPwd("");
    }
  }, [open, main.name, main.url]);

  const tryAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      toast({ title: "Welcome, admin", description: "You can now manage channels." });
    } else {
      toast({ title: "Wrong password", variant: "destructive" });
    }
  };

  const saveMain = () => {
    if (!mainName.trim() || !mainUrl.trim()) {
      toast({ title: "Name and URL required", variant: "destructive" });
      return;
    }
    updateMain({ name: mainName.trim(), url: mainUrl.trim() });
    toast({ title: "Main channel updated" });
  };

  const addOne = () => {
    if (!newName.trim() || !newUrl.trim()) {
      toast({ title: "Name and URL required", variant: "destructive" });
      return;
    }
    addExtra({ name: newName.trim(), url: newUrl.trim() });
    setNewName("");
    setNewUrl("");
    toast({ title: "Channel added" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" /> Admin Panel
          </DialogTitle>
          <DialogDescription>
            Manage the main channel and add additional Telegram channels shown across the site.
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
          <div className="space-y-6 pt-2">
            <section className="space-y-3 rounded-xl border border-border/60 p-4 bg-secondary/40">
              <h3 className="font-display font-semibold">Main channel</h3>
              <div className="space-y-2">
                <Label htmlFor="m-name">Name</Label>
                <Input id="m-name" value={mainName} onChange={(e) => setMainName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-url">Telegram URL</Label>
                <Input id="m-url" value={mainUrl} onChange={(e) => setMainUrl(e.target.value)} placeholder="https://t.me/..." />
              </div>
              <Button onClick={saveMain} variant="hero" size="sm">
                <Save className="size-4" /> Save main channel
              </Button>
            </section>

            <section className="space-y-3 rounded-xl border border-border/60 p-4">
              <h3 className="font-display font-semibold">Additional channels</h3>
              {extras.length === 0 && (
                <p className="text-xs text-muted-foreground">No extra channels yet. Add one below.</p>
              )}
              <ul className="space-y-3">
                {extras.map((c) => (
                  <li key={c.id} className="space-y-2 rounded-lg border border-border/60 p-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={c.name}
                        onChange={(e) => updateExtra(c.id, { name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">URL</Label>
                      <Input
                        value={c.url}
                        onChange={(e) => updateExtra(c.id, { url: e.target.value })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExtra(c.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" /> Remove
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 rounded-lg bg-secondary/40 p-3">
                <Label className="text-xs">Add new channel</Label>
                <Input placeholder="Channel name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input placeholder="https://t.me/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                <Button onClick={addOne} variant="hero" size="sm" className="w-full">
                  <Plus className="size-4" /> Add channel
                </Button>
              </div>
            </section>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem(SESSION_KEY);
                setAuthed(false);
              }}
              className="w-full"
            >
              Lock admin panel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
