import { useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useAdminMode } from "@/hooks/useAdminMode";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

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

  if (!adminMode) {
    const Wrapper = Tag as keyof JSX.IntrinsicElements;
    // Render with whitespace preserved for multiline
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Wrapper className={className as any}>
        {multiline
          ? value.split("\n").map((ln, i) => (
              <span key={i}>
                {ln}
                {i < value.split("\n").length - 1 ? <br /> : null}
              </span>
            ))
          : value}
      </Wrapper>
    );
  }

  if (editing) {
    return (
      <span className={cn("inline-block w-full align-top", className)}>
        <textarea
          ref={ref}
          value={draft}
          maxLength={maxLength}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={onCommit}
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
        <span className="mt-1 block text-[10px] uppercase tracking-widest text-primary">
          {saving ? "Saving…" : "Enter to save · Esc to cancel"}
        </span>
      </span>
    );
  }

  const Wrapper = Tag as keyof JSX.IntrinsicElements;
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Wrapper
      className={cn(
        "relative cursor-text rounded-sm outline-dashed outline-1 outline-offset-2 outline-primary/40 hover:outline-primary",
        className,
      ) as any}
      onDoubleClick={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditing(true);
      }}
      title="Double-click to edit"
    >
      {multiline
        ? value.split("\n").map((ln, i) => (
            <span key={i}>
              {ln}
              {i < value.split("\n").length - 1 ? <br /> : null}
            </span>
          ))
        : value}
      <Pencil className="ml-1 inline-block size-3 align-middle text-primary/70" />
    </Wrapper>
  );
}