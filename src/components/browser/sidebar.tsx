import {
  Bookmark,
  Clock3,
  Home,
  Palette,
  Settings,
  SlidersHorizontal,
  Youtube,
} from "lucide-react";
import { YT_SUBSCRIBE } from "@/lib/browse";
import { playUiTone } from "@/lib/sound";
import { useBrowserStore, type PanelId } from "@/lib/browser-store";
import { useThemeStore } from "@/lib/theme-store";
import { cn } from "@/lib/utils";

type RailId = Exclude<PanelId, "none"> | "home" | "subscribe";

const RAIL: { id: RailId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "New tab", icon: Home },
  { id: "gx", label: "GX Control", icon: SlidersHorizontal },
  { id: "color", label: "Colors", icon: Palette },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "history", label: "History", icon: Clock3 },
  { id: "settings", label: "Install", icon: Settings },
];

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const panel = useBrowserStore((s) => s.panel);
  const togglePanel = useBrowserStore((s) => s.togglePanel);
  const home = useBrowserStore((s) => s.home);
  const sound = useThemeStore((s) => s.sound);

  function go(id: RailId) {
    if (sound) playUiTone("click");
    if (id === "home") {
      home();
      return;
    }
    if (id === "subscribe") {
      window.open(YT_SUBSCRIBE, "_blank", "noopener,noreferrer");
      return;
    }
    togglePanel(id);
  }

  return (
    <nav
      className={cn(
        "flex shrink-0 bg-gx-surface",
        mobile
          ? "h-16 w-full items-center justify-around border-t border-gx-border px-1 pb-[env(safe-area-inset-bottom)]"
          : "hidden w-14 flex-col items-center gap-1 border-r border-gx-border py-3 md:flex",
      )}
    >
      {!mobile && (
        <img src="/logo-face.png" alt="" className="pixelated mb-3 size-8 rounded-[var(--radius-xs)] object-cover" />
      )}
      {RAIL.map((item) => {
        const Icon = item.icon;
        const active = item.id === panel;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            aria-pressed={active}
            onClick={() => go(item.id)}
            className={cn(
              "relative flex size-11 items-center justify-center rounded-[var(--radius-sm)] text-gx-muted transition-colors duration-[var(--motion-quick)] hover:bg-gx-elevated hover:text-gx-fg",
              active && "bg-gx-accent-soft text-gx-accent",
            )}
          >
            {active && (
              <span
                className={cn(
                  "absolute bg-gx-accent",
                  mobile ? "top-1 h-0.5 w-4 rounded-full" : "left-0 h-5 w-0.5 rounded-full",
                )}
              />
            )}
            <Icon className="size-5" />
          </button>
        );
      })}
      <button
        type="button"
        aria-label="Subscribe on YouTube"
        onClick={() => go("subscribe")}
        className={cn(
          "flex size-11 items-center justify-center rounded-[var(--radius-sm)] text-gx-hot transition-colors duration-[var(--motion-quick)] hover:bg-gx-hot-soft",
          mobile ? "" : "mt-auto",
        )}
      >
        <Youtube className="size-5" />
      </button>
    </nav>
  );
}
