import { useEffect } from "react";
import { AddressBar } from "@/components/browser/address-bar";
import { ColorStudio } from "@/components/browser/color-studio";
import { GxControl } from "@/components/browser/gx-control";
import { Sidebar } from "@/components/browser/sidebar";
import { BookmarksPanel, HistoryPanel, SettingsPanel } from "@/components/browser/side-lists";
import { TabBar } from "@/components/browser/tab-bar";
import { WebView } from "@/components/browser/web-view";
import { ensureActiveId, useBrowserStore } from "@/lib/browser-store";
import { playUiTone } from "@/lib/sound";
import { paintTheme, useThemeStore } from "@/lib/theme-store";
import { cn } from "@/lib/utils";

export function BrowserShell() {
  useEffect(() => {
    ensureActiveId();
    paintTheme();
  }, []);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-gx-bg text-gx-fg">
      <BrowserChrome />
    </div>
  );
}

function BrowserChrome() {
  const panel = useBrowserStore((s) => s.panel);
  const setPanel = useBrowserStore((s) => s.setPanel);
  const newTab = useBrowserStore((s) => s.newTab);
  const closeTab = useBrowserStore((s) => s.closeTab);
  const activeId = useBrowserStore((s) => s.activeId);
  const sound = useThemeStore((s) => s.sound);
  const open = panel !== "none";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "t") {
        e.preventDefault();
        newTab();
        if (sound) playUiTone("open");
      }
      if (meta && e.key.toLowerCase() === "w") {
        e.preventDefault();
        closeTab(activeId);
        if (sound) playUiTone("close");
      }
      if (meta && e.key.toLowerCase() === "l") {
        e.preventDefault();
        document.getElementById("gx-omni")?.focus();
      }
      if (e.key === "Escape") setPanel("none");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, closeTab, newTab, setPanel, sound]);

  return (
    <>
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TabBar />
          <AddressBar />
          <div className="relative min-h-0 flex-1">
            <WebView />
            <div
              className={cn(
                "absolute inset-0 z-20 bg-gx-bg/40 transition-opacity duration-[var(--motion-fast)] ease-[var(--ease-out)] md:bg-transparent md:pointer-events-none",
                open ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              onClick={() => setPanel("none")}
            />
            <div
              className={cn(
                "absolute inset-y-0 right-0 z-30 w-full max-w-md shadow-[var(--shadow-border)] transition-transform duration-[var(--motion-slow)] ease-[var(--ease-smooth-out)] md:duration-[var(--motion-fast)]",
                open ? "translate-x-0" : "pointer-events-none translate-x-full",
              )}
            >
              {panel === "color" && <ColorStudio onClose={() => setPanel("none")} />}
              {panel === "gx" && <GxControl onClose={() => setPanel("none")} />}
              {panel === "bookmarks" && <BookmarksPanel onClose={() => setPanel("none")} />}
              {panel === "history" && <HistoryPanel onClose={() => setPanel("none")} />}
              {panel === "settings" && <SettingsPanel onClose={() => setPanel("none")} />}
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden">
        <Sidebar mobile />
      </div>
    </>
  );
}
