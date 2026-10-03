import { ExternalLink, ShieldAlert } from "lucide-react";
import { hostLikelyBlocked, hostnameOf } from "@/lib/browse";
import { useBrowserStore } from "@/lib/browser-store";
import { Button } from "@/components/ui/button";
import { NewTabPage } from "@/components/browser/new-tab";

export function WebView() {
  const tab = useBrowserStore((s) => s.tabs.find((t) => t.id === s.activeId) ?? s.tabs[0]!);
  const setTabLoading = useBrowserStore((s) => s.setTabLoading);

  if (!tab.url) return <NewTabPage />;

  const blocked = hostLikelyBlocked(tab.url);
  const host = hostnameOf(tab.url);

  return (
    <div className="relative h-full bg-gx-bg">
      {!blocked && (
        <iframe
          key={`${tab.id}-${tab.url}-${tab.historyIndex}`}
          title={tab.title}
          src={tab.url}
          className="h-full w-full border-0 bg-gx-bg"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setTabLoading(tab.id, false)}
        />
      )}
      {blocked && (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-gx-elevated text-gx-hot">
            <ShieldAlert className="size-6" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-gx-fg">{host}</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-gx-muted">
              This site blocks in-app frames. Open it in a system window — your GX theme stays here.
            </p>
          </div>
          <Button onClick={() => window.open(tab.url, "_blank", "noopener,noreferrer")}>
            <ExternalLink className="size-4" />
            Open {host}
          </Button>
        </div>
      )}
    </div>
  );
}
