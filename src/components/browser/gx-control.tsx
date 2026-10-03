import { useEffect, useState, type ReactNode } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Cpu, Gauge, Volume2, VolumeX, Wifi } from "lucide-react";
import { PanelFrame } from "@/components/browser/color-studio";
import { playUiTone } from "@/lib/sound";
import { useThemeStore } from "@/lib/theme-store";

export function GxControl({ onClose }: { onClose: () => void }) {
  const cpuLimit = useThemeStore((s) => s.cpuLimit);
  const ramLimit = useThemeStore((s) => s.ramLimit);
  const netLimit = useThemeStore((s) => s.netLimit);
  const sound = useThemeStore((s) => s.sound);
  const setCpuLimit = useThemeStore((s) => s.setCpuLimit);
  const setRamLimit = useThemeStore((s) => s.setRamLimit);
  const setNetLimit = useThemeStore((s) => s.setNetLimit);
  const setSound = useThemeStore((s) => s.setSound);
  const [cpu, setCpu] = useState(32);
  const [net, setNet] = useState(18);
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: 18 }, () => 20));

  useEffect(() => {
    const id = window.setInterval(() => {
      setCpu((n) => {
        const target = 12 + (cpuLimit / 100) * 55;
        const next = n + (target - n) * 0.18 + (Math.random() - 0.5) * 8;
        return Math.max(6, Math.min(cpuLimit, next));
      });
      setNet((n) => {
        const target = (netLimit / 100) * 40;
        return Math.max(2, n + (target - n) * 0.2 + (Math.random() - 0.45) * 10);
      });
      setBars((prev) => prev.map((v, i) => {
        const wave = 20 + Math.sin(Date.now() / 280 + i) * (cpuLimit / 4);
        return Math.max(8, Math.min(100, v * 0.6 + wave * 0.4));
      }));
    }, cpuLimit < 28 ? 240 : 90);
    return () => window.clearInterval(id);
  }, [cpuLimit, netLimit]);

  const ramUsed = Math.min(ramLimit * 0.62 + 0.8, ramLimit);

  return (
    <PanelFrame title="GX Control" onClose={onClose}>
      <p className="text-sm leading-relaxed text-gx-muted">
        Cap resources so the rest of the machine stays fast. Limits tint the chrome and slow motion when CPU is tight.
      </p>

      <Meter
        icon={<Cpu className="size-4" />}
        label="CPU limiter"
        value={`${Math.round(cpu)}% / ${cpuLimit}%`}
      >
        <div className="mb-3 flex h-14 items-end gap-px">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[1px] bg-gx-accent"
              style={{ height: `${h}%`, opacity: 0.35 + (h / 100) * 0.65 }}
            />
          ))}
        </div>
        <GxSlider value={cpuLimit} min={10} max={100} onChange={setCpuLimit} />
      </Meter>

      <Meter
        icon={<Gauge className="size-4" />}
        label="RAM limiter"
        value={`${ramUsed.toFixed(1)} / ${ramLimit} GB`}
      >
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-gx-elevated">
          <div
            className="h-full rounded-full bg-gx-hot transition-[width] duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]"
            style={{ width: `${(ramUsed / 16) * 100}%` }}
          />
        </div>
        <GxSlider value={ramLimit} min={1} max={16} onChange={setRamLimit} />
      </Meter>

      <Meter
        icon={<Wifi className="size-4" />}
        label="Network limiter"
        value={`${Math.round(net * (netLimit / 10))} Mbps`}
      >
        <GxSlider value={netLimit} min={5} max={100} onChange={setNetLimit} />
      </Meter>

      <button
        type="button"
        onClick={() => {
          setSound(!sound);
          if (!sound) playUiTone("open");
        }}
        className="mt-4 flex h-12 w-full items-center justify-between rounded-[var(--radius-md)] bg-gx-elevated px-4 shadow-[var(--shadow-border)]"
      >
        <span className="flex items-center gap-2 text-sm text-gx-fg">
          {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          Browser sounds
        </span>
        <span className="font-mono text-xs text-gx-muted">{sound ? "ON" : "OFF"}</span>
      </button>
    </PanelFrame>
  );
}

function Meter({
  icon,
  label,
  value,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-5 rounded-[var(--radius-lg)] bg-gx-elevated p-4 shadow-[var(--shadow-border)]">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gx-fg">
          <span className="text-gx-accent">{icon}</span>
          {label}
        </h3>
        <span className="font-mono text-xs tabular-nums text-gx-muted">{value}</span>
      </header>
      {children}
    </section>
  );
}

function GxSlider({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <Slider.Root
      value={[value]}
      min={min}
      max={max}
      step={1}
      onValueChange={(v) => onChange(v[0] ?? min)}
      className="relative flex h-6 w-full touch-none items-center"
    >
      <Slider.Track className="relative h-1.5 grow rounded-full bg-gx-surface">
        <Slider.Range className="absolute h-full rounded-full bg-gx-accent" />
      </Slider.Track>
      <Slider.Thumb className="block size-4 rounded-full bg-gx-fg shadow-[var(--shadow-border)] focus-visible:outline-2 focus-visible:outline-gx-accent" />
    </Slider.Root>
  );
}
