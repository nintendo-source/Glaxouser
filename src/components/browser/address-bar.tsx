import type { FormEvent, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Palette,
  RotateCw,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { useBrowserStore } from "@/lib/browser-store";
import { playUiTone } from "@/lib/sound";
import { useThemeStore } from "@/lib/theme-store";
import { cn } from "@/lib/utils";

export function AddressBar() {
  const tab = useBrowserStore((s) => s.tabs.find((t) => t.id === s.activeId) ?? s.tabs[0]!);
  const draft = useBrowserStore((s) => s.addressDraft);
  const setDraft = useBrowserStore((s) => s.setAddressDraft);
  const navigate = useBrowserStore((s) => s.navigate);
  const back = useBrowserStore((s) => s.back);
  const forward = useBrowserStore((s) => s.forward);
  const reload = useBrowserStore((s) => s.reload);
  const home = useBrowserStore((s) => s.home);
  const star = useBrowserStore((s) => s.star);
  const unstar = useBrowserStore((s) => s.unstar);
  const bookmarks = useBrowserStore((s) => s.bookmarks);
  const togglePanel = useBrowserStore((s) => s.togglePanel);
  const panel = useBrowserStore((s) => s.panel);
  const sound = useThemeStore((s) => s.sound);

  const starred = bookmarks.some((b) => b.url === tab.url && tab.url);
  const canBack = tab.historyIndex > 0;
  const canFwd = tab.historyIndex < tab.history.length - 1;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (sound) playUiTone("nav");
    navigate(draft, { fromAddress: true });
  }

  return (
    <div className="relative flex h-14 shrink-0 items-center gap-1 bg-gx-surface px-2 md:gap-2 md:px-3">
      <IconBtn label="Back" disabled={!canBack} onClick={back}>
        <ArrowLeft className="size-4" />
      </IconBtn>
      <IconBtn label="Forward" disabled={!canFwd} onClick={forward}>
        <ArrowRight className="size-4" />
      </IconBtn>
      <IconBtn
        label="Reload"
        onClick={() => {
          reload();
          if (tab.url) navigate(tab.url);
        }}
      >
        <RotateCw className={cn("size-4", tab.loading && "animate-spin")} />
      </IconBtn>
      <IconBtn label="Home" onClick={home} className="hidden sm:flex">
        <Home className="size-4" />
      </IconBtn>

      <form onSubmit={submit} className="min-w-0 flex-1">
        <label className="flex h-11 items-center gap-2 rounded-full bg-gx-bg px-3 shadow-[var(--shadow-border)] md:px-4">
          <span className="hidden font-display text-xs font-semibold tracking-wider text-gx-accent sm:inline">
            GX
          </span>
          <input
            id="gx-omni"
            value={draft}
            placeholder="Search or enter address"
            aria-label="Search or enter address"
            className="min-w-0 flex-1 bg-transparent text-sm text-gx-fg outline-none placeholder:text-gx-muted"
            onChange={(e) => setDraft(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            suppressHydrationWarning
          />
          <button
            type="button"
            aria-label={starred ? "Remove bookmark" : "Bookmark"}
            className={cn(
              "flex size-9 items-center justify-center rounded-full",
              starred ? "text-gx-hot" : "text-gx-muted hover:text-gx-fg",
            )}
            onClick={() => {
              if (!tab.url) return;
              if (starred) {
                const bm = bookmarks.find((b) => b.url === tab.url);
                if (bm) unstar(bm.id);
              } else star();
            }}
          >
            <Star className="size-4" fill={starred ? "currentColor" : "none"} />
          </button>
        </label>
      </form>

      <IconBtn
        label="GX Control"
        className="hidden md:flex"
        active={panel === "gx"}
        onClick={() => togglePanel("gx")}
      >
        <SlidersHorizontal className="size-4" />
      </IconBtn>
      <IconBtn
        label="Colors"
        className="hidden md:flex"
        active={panel === "color"}
        onClick={() => togglePanel("color")}
      >
        <Palette className="size-4" />
      </IconBtn>

      {tab.loading && (
        <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
          <div className="h-full origin-left bg-gx-accent" style={{ animation: "gx-load 1.1s var(--ease-smooth-out) infinite" }} />
        </div>
      )}
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  active,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-11 items-center justify-center rounded-[var(--radius-sm)] text-gx-muted transition-colors duration-[var(--motion-quick)] hover:bg-gx-elevated hover:text-gx-fg disabled:opacity-30",
        active && "bg-gx-accent-soft text-gx-accent",
        className,
      )}
    >
      {children}
    </button>
  );
}
