import { SiteIcon } from "@/components/browser/site-icon";
import { Plus, X } from "lucide-react";
import { playUiTone } from "@/lib/sound";
import { useBrowserStore } from "@/lib/browser-store";
import { useThemeStore } from "@/lib/theme-store";
import { cn } from "@/lib/utils";

export function TabBar() {
  const tabs = useBrowserStore((s) => s.tabs);
  const activeId = useBrowserStore((s) => s.activeId);
  const selectTab = useBrowserStore((s) => s.selectTab);
  const closeTab = useBrowserStore((s) => s.closeTab);
  const newTab = useBrowserStore((s) => s.newTab);
  const sound = useThemeStore((s) => s.sound);

  return (
    <div className="flex h-11 shrink-0 items-end gap-1 overflow-x-auto bg-gx-bg px-2 pt-1 md:h-12">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <div
            key={tab.id}
            className={cn(
              "group relative flex h-9 min-w-[9.5rem] max-w-[15rem] shrink-0 items-center gap-2 px-3 text-xs transition-colors duration-[var(--motion-quick)] md:h-10 gx-tab-md",
              active ? "bg-gx-surface text-gx-fg" : "text-gx-muted hover:bg-gx-elevated hover:text-gx-fg",
            )}
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              onClick={() => selectTab(tab.id)}
            >
              {tab.url ? (
                <SiteIcon url={tab.url} size={14} />
              ) : (
                <span className="size-3.5 shrink-0 rounded-sm bg-gx-accent-soft" />
              )}
              <span className="truncate">{tab.title}</span>
            </button>
            <button
              type="button"
              aria-label={`Close ${tab.title}`}
              className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-xs)] opacity-70 hover:bg-gx-elevated hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                if (sound) playUiTone("close");
                closeTab(tab.id);
              }}
            >
              <X className="size-3.5" />
            </button>
            {active && (
              <span className="absolute inset-x-3 bottom-0 h-px bg-gx-accent md:inset-x-4" />
            )}
          </div>
        );
      })}
      <button
        type="button"
        aria-label="New tab"
        onClick={() => {
          if (sound) playUiTone("open");
          newTab();
        }}
        className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-gx-muted hover:bg-gx-elevated hover:text-gx-fg"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
