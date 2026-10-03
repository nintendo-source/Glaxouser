import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { hsvToHex, hsvToRgb, hexToHsv, normalizeHex } from "@/lib/color";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (hex: string) => void;
};

const SIZE = 220;

export function ColorWheel({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hsv = hexToHsv(value) ?? { h: 210, s: 0.76, v: 1 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;
    const img = ctx.createImageData(canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const R = (SIZE / 2 - 6) * dpr;
    const v = hsv.v;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy);
        const i = (y * canvas.width + x) * 4;
        if (dist > R) continue;
        let h = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (h < 0) h += 360;
        const s = dist / R;
        const { r, g, b } = hsvToRgb(h, s, v);
        img.data[i] = r;
        img.data[i + 1] = g;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [hsv.v]);

  function pick(e: ReactPointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const maxR = rect.width / 2 - 6;
    const dist = Math.hypot(dx, dy);
    let h = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (h < 0) h += 360;
    const s = Math.min(1, dist / maxR);
    onChange(hsvToHex(h, s, hsv.v));
  }

  const R = SIZE / 2 - 6;
  const knobX = SIZE / 2 + Math.cos((hsv.h * Math.PI) / 180) * hsv.s * R;
  const knobY = SIZE / 2 + Math.sin((hsv.h * Math.PI) / 180) * hsv.s * R;

  return (
    <div className="flex items-stretch gap-3">
      <div
        className="relative size-[220px] shrink-0 touch-none"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          pick(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons) pick(e);
        }}
        role="slider"
        aria-label="Color wheel"
        aria-valuetext={value}
      >
        <canvas
          ref={canvasRef}
          className="size-full rounded-full"
          style={{ width: SIZE, height: SIZE }}
        />
        <div
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: knobX,
            top: knobY,
            boxShadow: "0 0 0 2px #fff, 0 0 0 3px rgba(0,0,0,0.55)",
            background: value,
          }}
        />
      </div>
      <div className="flex w-8 flex-col">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(hsv.v * 100)}
          aria-label="Brightness"
          className="gx-vert-range h-full w-8 cursor-pointer appearance-none bg-transparent"
          onChange={(e) => onChange(hsvToHex(hsv.h, hsv.s, Number(e.target.value) / 100))}
          style={{
            writingMode: "vertical-lr",
            direction: "rtl",
          }}
        />
        <span className="mt-2 text-center font-mono text-[10px] text-gx-muted">
          {Math.round(hsv.v * 100)}
        </span>
      </div>
    </div>
  );
}

export function HexField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(value.replace(/^#/, ""));
  useEffect(() => setDraft(value.replace(/^#/, "")), [value]);

  return (
    <label className={cn("flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] bg-gx-elevated px-3 shadow-[var(--shadow-border)]", className)}>
      <span className="font-mono text-xs text-gx-muted">#</span>
      <input
        value={draft}
        spellCheck={false}
        aria-label="Hex color"
        className="min-w-0 flex-1 bg-transparent font-mono text-sm uppercase tracking-wide text-gx-fg outline-none"
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
          setDraft(raw);
          const n = normalizeHex(raw);
          if (n) onChange(n);
        }}
        maxLength={6}
      />
      <span
        className="relative size-7 shrink-0 overflow-hidden rounded-[var(--radius-xs)] shadow-[var(--shadow-border)]"
        style={{ background: normalizeHex(value) ?? undefined }}
      >
        <input
          type="color"
          value={normalizeHex(value) ?? "#3B9BFF"}
          aria-label="Native color picker"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => onChange(e.target.value.toUpperCase())}
        />
      </span>
    </label>
  );
}
