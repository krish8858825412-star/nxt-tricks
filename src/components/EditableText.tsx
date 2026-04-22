import { useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminMode } from "@/hooks/useAdminMode";

type Props = {
  contentKey: string;
  defaultValue: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  multiline?: boolean;
  maxLength?: number;
};

/**
 * Renders text from the `site_content` table. When admin mode is enabled,
 * a double-click / double-tap turns it into an editable textarea.
 * Edits propagate to all visitors via realtime.
 */
export function EditableText({
  contentKey,
  defaultValue,
  as: Tag = "span",
  className,
  multiline = false,
  maxLength = 1000,
}: Props) {
  const { value, save } = useSiteContent(contentKey, defaultValue);
  const { enabled: adminMode } = useAdminMode();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  const onCommit = async () => {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await save(draft);
      toast({ title: "Saved", description: "Visible to all visitors." });
      setEditing(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Try again";
      toast({ title: "Could not save", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (e?: React.MouseEvent | React.TouchEvent) => {
    if (!adminMode || editing) return;
    e?.preventDefault();
    e?.stopPropagation();
    setEditing(true);
  };

  if (editing) {
    return (
      <span data-no-ripple className={cn("inline-block w-full align-top", className)}>
        <textarea
          ref={ref}
          value={draft}
          maxLength={maxLength}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setEditing(false);
              setDraft(value);
            }
            if (e.key === "Enter" && !multiline && !e.shiftKey) {
              e.preventDefault();
              onCommit();
            }
          }}
          rows={multiline ? Math.max(2, draft.split("\n").length + 1) : 1}
          disabled={saving}
          className={cn(
            "w-full resize-y rounded-md border-2 border-primary bg-background/95 px-2 py-1 outline-none ring-2 ring-primary/30 font-[inherit] text-[inherit] leading-[inherit] tracking-[inherit]",
            !multiline && "resize-none",
          )}
          aria-label={`Edit ${contentKey}`}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="block text-[10px] uppercase tracking-widest text-primary">
            {saving ? "Saving…" : "Tap Done to save · Esc to cancel"}
          </span>
          <Button data-no-ripple type="button" size="sm" variant="hero" className="h-7 px-3" onClick={onCommit} disabled={saving}>
            Done
          </Button>
        </div>
      </span>
    );
  }

  const Wrapper = Tag as keyof JSX.IntrinsicElements;
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Wrapper
      className={cn(
        "group relative rounded-sm",
        adminMode && "cursor-text",
        className,
      ) as any}
      onClick={startEditing}
      title={adminMode ? "Tap to edit" : undefined}
    >
      {multiline
        ? value.split("\n").map((ln, i) => (
            <span key={i}>
              {ln}
              {i < value.split("\n").length - 1 ? <br /> : null}
            </span>
          ))
        : value}
      {adminMode && (
        <span
          data-no-ripple
          className="pointer-events-none absolute -right-2 -top-2 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-background/90 px-2 py-1 text-[10px] uppercase tracking-widest text-primary opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <Pencil className="size-3" /> Edit
        </span>
      )}
    </Wrapper>
  );
}