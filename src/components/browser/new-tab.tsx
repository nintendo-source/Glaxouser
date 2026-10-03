import { Search, Youtube } from "lucide-react";
import { YT_SUBSCRIBE, googleHome } from "@/lib/browse";
import { useBrowserStore } from "@/lib/browser-store";
import { playUiTone } from "@/lib/sound";
import { useThemeStore } from "@/lib/theme-store";
import { Button } from "@/components/ui/button";
import { SiteIcon } from "@/components/browser/site-icon";
import { useEffect, useState, type FormEvent } from "react";

const DIALS = [
  { title: "Google", url: googleHome(), hint: "Search", icon: "https://www.google.com" },
  { title: "Wikipedia", url: "https://en.wikipedia.org", hint: "Read", icon: "https://en.wikipedia.org" },
  {
    title: "YouTube",
    url: "https://www.youtube.com/embed?listType=search&list=Glaxiblade",
    hint: "Watch",
    icon: "https://www.youtube.com",
  },
  { title: "Archive", url: "https://web.archive.org", hint: "Web", icon: "https://web.archive.org" },
  {
    title: "News",
    url: "https://www.google.com/search?igu=1&q=gaming+news",
    hint: "Feed",
    icon: "https://news.google.com",
  },
  {
    title: "Wiki Game",
    url: "https://en.wikipedia.org/wiki/Video_game",
    hint: "Play",
    icon: "https://en.wikipedia.org",
  },
];

export function NewTabPage() {
  const navigate = useBrowserStore((s) => s.navigate);
  const setDraft = useBrowserStore((s) => s.setAddressDraft);
  const sound = useThemeStore((s) => s.sound);
  const ramLimit = useThemeStore((s) => s.ramLimit);
  const cpuLimit = useThemeStore((s) => s.cpuLimit);
  const [clock, setClock] = useState(() => new Date());
  const [query, setQuery] = useState("");

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hh = clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  function runSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    if (sound) playUiTone("nav");
    setDraft(query);
    navigate(query, { fromAddress: true });
  }

  return (
    <div className="gx-noise relative h-full overflow-y-auto bg-gx-bg">
      <div className="gx-force-wash" />
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 py-8 sm:py-12">
        <header className="gx-stagger flex flex-col items-center text-center">
          <img
            src="/logo-face.png"
            alt=""
            className="pixelated mb-4 size-16 rounded-[var(--radius-md)] object-cover sm:size-20"
          />
          <p
            className="font-display text-4xl font-semibold tracking-[-0.03em] text-gx-fg sm:text-5xl"
            suppressHydrationWarning
          >
            {hh}
          </p>
          <p className="mt-1 font-display text-sm tracking-[0.22em] text-gx-muted">GLAXOUSER</p>
        </header>

        <form onSubmit={runSearch} className="mt-8">
          <label className="flex h-12 items-center gap-3 rounded-[var(--radius-lg)] bg-gx-surface px-4 shadow-[var(--shadow-border)]">
            <Search className="size-4 shrink-0 text-gx-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the web"
              aria-label="Search the web"
              className="min-w-0 flex-1 bg-transparent text-sm text-gx-fg outline-none placeholder:text-gx-muted"
              suppressHydrationWarning
            />
          </label>
        </form>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {DIALS.map((d) => (
            <button
              key={d.title}
              type="button"
              onClick={() => {
                if (sound) playUiTone("nav");
                navigate(d.url);
              }}
              className="flex h-24 flex-col items-start justify-between rounded-[var(--radius-lg)] bg-gx-surface p-4 text-left shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:shadow-[var(--shadow-border-hover)] active:scale-[0.96]"
            >
              <span className="flex size-8 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-gx-elevated">
                <SiteIcon url={d.icon} size={32} />
              </span>
              <span>
                <span className="block text-sm font-medium text-gx-fg">{d.title}</span>
                <span className="text-xs text-gx-muted">{d.hint}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="RAM cap" value={`${ramLimit} GB`} />
          <Stat label="CPU cap" value={`${cpuLimit}%`} />
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 rounded-[var(--radius-lg)] bg-gx-surface p-4 shadow-[var(--shadow-border)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-gx-hot-soft text-gx-hot">
              <Youtube className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-gx-fg">SUBSCRIBE Glaxiblade on YouTube its free</p>
              <p className="text-xs text-gx-muted">New packs, overlays, and drops.</p>
            </div>
          </div>
          <Button
            variant="hot"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => window.open(YT_SUBSCRIBE, "_blank", "noopener,noreferrer")}
          >
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-gx-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-[11px] uppercase tracking-wider text-gx-muted">{label}</p>
      <p className="mt-1 font-mono text-lg tabular-nums text-gx-fg">{value}</p>
    </div>
  );
}
