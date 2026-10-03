import type { ReactNode } from "react";
import { Pipette, RotateCcw, X } from "lucide-react";
import { ColorWheel, HexField } from "@/components/browser/color-wheel";
import { Button } from "@/components/ui/button";
import { hexToRgb, normalizeHex } from "@/lib/color";
import { playUiTone } from "@/lib/sound";
import { THEME_PRESETS, useThemeStore, type ColorSlot } from "@/lib/theme-store";
import { cn } from "@/lib/utils";

const SLOTS: { id: ColorSlot; label: string }[] = [
  { id: "accent", label: "Accent" },
  { id: "hot", label: "Highlight" },
  { id: "bg", label: "Background" },
];

export function ColorStudio({ onClose }: { onClose: () => void }) {
  const slot = useThemeStore((s) => s.slot);
  const accent = useThemeStore((s) => s.accent);
  const hot = useThemeStore((s) => s.hot);
  const bg = useThemeStore((s) => s.bg);
  const forceColor = useThemeStore((s) => s.forceColor);
  const sound = useThemeStore((s) => s.sound);
  const setSlot = useThemeStore((s) => s.setSlot);
  const setColor = useThemeStore((s) => s.setColor);
  const applyPreset = useThemeStore((s) => s.applyPreset);
  const setForceColor = useThemeStore((s) => s.setForceColor);
  const reset = useThemeStore((s) => s.reset);

  const value = slot === "accent" ? accent : slot === "hot" ? hot : bg;
  const rgb = hexToRgb(value);

  function commit(hex: string) {
    setColor(slot, hex);
    if (sound) playUiTone("click");
  }

  async function eyedrop() {
    const ED = (
      window as unknown as {
        EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
      }
    ).EyeDropper;
    if (!ED) return;
    try {
      const result = await new ED().open();
      const n = normalizeHex(result.sRGBHex);
      if (n) commit(n);
    } catch {
      /* cancelled */
    }
  }

  return (
    <PanelFrame title="Color studio" onClose={onClose}>
      <div className="flex gap-1 rounded-[var(--radius-md)] bg-gx-elevated p-1">
        {SLOTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSlot(s.id)}
            className={cn(
              "h-10 flex-1 rounded-[var(--radius-sm)] text-xs font-medium transition-colors duration-[var(--motion-quick)]",
              slot === s.id ? "bg-gx-surface text-gx-fg" : "text-gx-muted hover:text-gx-fg",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-center">
        <ColorWheel value={value} onChange={commit} />
      </div>

      <div className="mt-4">
        <HexField value={value} onChange={commit} />
      </div>

      {rgb && (
        <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px] text-gx-muted">
          <SwatchStat label="R" value={rgb.r} />
          <SwatchStat label="G" value={rgb.g} />
          <SwatchStat label="B" value={rgb.b} />
        </div>
      )}

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-gx-muted">Force color</span>
          <span className="font-mono tabular-nums text-gx-fg">{forceColor}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={55}
          value={forceColor}
          aria-label="Force color intensity"
          className="w-full accent-[var(--gx-accent)]"
          onChange={(e) => setForceColor(Number(e.target.value))}
        />
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wider text-gx-muted">Presets</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {THEME_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              applyPreset(p);
              if (sound) playUiTone("click");
            }}
            className="flex h-12 items-center gap-2 rounded-[var(--radius-md)] bg-gx-elevated px-3 text-left shadow-[var(--shadow-border)] transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            <span className="flex size-6 overflow-hidden rounded-full">
              <span className="h-full w-1/2" style={{ background: p.accent }} />
              <span className="h-full w-1/2" style={{ background: p.hot }} />
            </span>
            <span className="text-xs font-medium text-gx-fg">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        {"EyeDropper" in globalThis && (
          <Button variant="quiet" className="flex-1" onClick={() => void eyedrop()}>
            <Pipette className="size-4" />
            Dropper
          </Button>
        )}
        <Button variant="ghost" className="flex-1" onClick={reset}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>
    </PanelFrame>
  );
}

function SwatchStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-gx-elevated px-2 py-2 text-center">
      <div className="text-[10px]">{label}</div>
      <div className="tabular-nums text-gx-fg">{value}</div>
    </div>
  );
}

export function PanelFrame({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <aside className="flex h-full flex-col bg-gx-surface">
      <header className="flex h-14 shrink-0 items-center justify-between px-4">
        <h2 className="font-display text-lg font-semibold tracking-wide text-gx-fg">{title}</h2>
        <button
          type="button"
          aria-label="Close panel"
          onClick={onClose}
          className="flex size-11 items-center justify-center rounded-[var(--radius-sm)] text-gx-muted transition-colors hover:bg-gx-elevated hover:text-gx-fg"
        >
          <X className="size-5" />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">{children}</div>
    </aside>
  );
}
