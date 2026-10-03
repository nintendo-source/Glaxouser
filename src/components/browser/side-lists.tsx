import type { ReactNode } from "react";
import { Bookmark, Clock3, MonitorSmartphone, Trash2 } from "lucide-react";
import { PanelFrame } from "@/components/browser/color-studio";
import { SiteIcon } from "@/components/browser/site-icon";
import { Button } from "@/components/ui/button";
import { hostnameOf } from "@/lib/browse";
import { useBrowserStore } from "@/lib/browser-store";

export function BookmarksPanel({ onClose }: { onClose: () => void }) {
  const bookmarks = useBrowserStore((s) => s.bookmarks);
  const navigate = useBrowserStore((s) => s.navigate);
  const unstar = useBrowserStore((s) => s.unstar);

  return (
    <PanelFrame title="Bookmarks" onClose={onClose}>
      {bookmarks.length === 0 ? (
        <Empty icon={<Bookmark className="size-5" />} text="Star a page from the address bar." />
      ) : (
        <ul className="flex flex-col gap-1">
          {bookmarks.map((b) => (
            <li key={b.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigate(b.url)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left hover:bg-gx-elevated"
              >
                <SiteIcon url={b.url} size={20} />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-gx-fg">{b.title}</span>
                  <span className="block truncate font-mono text-[11px] text-gx-muted">
                    {hostnameOf(b.url) || b.url}
                  </span>
                </span>
              </button>
              <button
                type="button"
                aria-label={`Remove ${b.title}`}
                className="flex size-11 items-center justify-center text-gx-muted hover:text-gx-fg"
                onClick={() => unstar(b.id)}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelFrame>
  );
}

export function HistoryPanel({ onClose }: { onClose: () => void }) {
  const history = useBrowserStore((s) => s.history);
  const navigate = useBrowserStore((s) => s.navigate);
  const clearHistory = useBrowserStore((s) => s.clearHistory);

  return (
    <PanelFrame title="History" onClose={onClose}>
      {history.length > 0 && (
        <Button variant="ghost" size="sm" className="mb-3" onClick={clearHistory}>
          Clear
        </Button>
      )}
      {history.length === 0 ? (
        <Empty icon={<Clock3 className="size-5" />} text="Pages you open will land here." />
      ) : (
        <ul className="flex flex-col gap-1">
          {history.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => navigate(h.url)}
                className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left hover:bg-gx-elevated"
              >
                <SiteIcon url={h.url} size={20} />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-gx-fg">{h.title}</span>
                  <span className="block font-mono text-[11px] text-gx-muted">
                    {new Date(h.visitedAt).toLocaleString()}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelFrame>
  );
}

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  return (
    <PanelFrame title="Install Glaxouser" onClose={onClose}>
      <div className="flex size-14 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-gx-elevated">
        <img src="/logo-face.png" alt="" className="pixelated size-14 object-cover" />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-gx-muted">
        Install Glaxouser as a standalone app. On Android it pins to your home screen like a store app.
        On Windows it opens in its own window from Chrome or Edge.
      </p>
      <ul className="mt-5 space-y-3 text-sm text-gx-fg">
        <li className="rounded-[var(--radius-md)] bg-gx-elevated p-3">
          <p className="font-medium">Android app</p>
          <p className="mt-1 text-gx-muted">
            Chrome menu → Install app / Add to Home screen. Uses the Blade face icon.
          </p>
        </li>
        <li className="rounded-[var(--radius-md)] bg-gx-elevated p-3">
          <p className="font-medium">Windows desktop app</p>
          <p className="mt-1 text-gx-muted">
            Chrome or Edge → Install page as app. That is the portable windowed build.
          </p>
        </li>
      </ul>
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-gx-muted">
        <MonitorSmartphone className="mt-0.5 size-4 shrink-0" />
        A Play Store APK and a Windows .exe cannot be compiled in this builder. Install as app is the native-style package.
      </p>
    </PanelFrame>
  );
}

function Empty({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center text-gx-muted">
      {icon}
      <p className="max-w-[22ch] text-sm">{text}</p>
    </div>
  );
}
