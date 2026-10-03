import { create } from "zustand";
import { persist } from "zustand/middleware";
import { contrastText, mixHex, mutedText, normalizeHex, relativeLuminance } from "@/lib/color";

export type ColorSlot = "accent" | "hot" | "bg";

export type ThemePreset = {
  id: string;
  name: string;
  accent: string;
  hot: string;
  bg: string;
};

export const THEME_PRESETS: ThemePreset[] = [
  { id: "blade", name: "Blade Dual", accent: "#3B9BFF", hot: "#FF3D9A", bg: "#050506" },
  { id: "gx", name: "GX Crimson", accent: "#FF2A2A", hot: "#FF7A18", bg: "#070708" },
  { id: "toxic", name: "Toxic", accent: "#B6FF3B", hot: "#3BFFE0", bg: "#050805" },
  { id: "ice", name: "Ice Wire", accent: "#D7E2EA", hot: "#7EB6FF", bg: "#0B0E12" },
  { id: "ember", name: "Ember", accent: "#FF5A1F", hot: "#FFC53B", bg: "#0C0705" },
  { id: "mono", name: "Carbon", accent: "#E7E7EA", hot: "#A0A0AB", bg: "#09090B" },
];

export const DEFAULT_THEME = THEME_PRESETS[0]!;

type ThemeState = {
  accent: string;
  hot: string;
  bg: string;
  slot: ColorSlot;
  cpuLimit: number;
  ramLimit: number;
  netLimit: number;
  sound: boolean;
  forceColor: number;
  setSlot: (slot: ColorSlot) => void;
  setColor: (slot: ColorSlot, hex: string) => void;
  applyPreset: (preset: ThemePreset) => void;
  setCpuLimit: (n: number) => void;
  setRamLimit: (n: number) => void;
  setNetLimit: (n: number) => void;
  setSound: (v: boolean) => void;
  setForceColor: (n: number) => void;
  reset: () => void;
};

function applyToDom(state: {
  accent: string;
  hot: string;
  bg: string;
  cpuLimit: number;
  forceColor: number;
}) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const light = relativeLuminance(state.bg) > 0.45;
  const fg = contrastText(state.bg);
  const muted = mutedText(state.bg);
  const surface = mixHex(state.bg, light ? "#000000" : "#FFFFFF", light ? 0.05 : 0.07);
  const elevated = mixHex(state.bg, light ? "#000000" : "#FFFFFF", light ? 0.09 : 0.12);
  const accentFg = contrastText(state.accent);
  const hotFg = contrastText(state.hot);

  root.style.setProperty("--gx-accent", state.accent);
  root.style.setProperty("--gx-hot", state.hot);
  root.style.setProperty("--gx-bg", state.bg);
  root.style.setProperty("--gx-fg", fg);
  root.style.setProperty("--gx-muted", muted);
  root.style.setProperty("--gx-surface", surface);
  root.style.setProperty("--gx-elevated", elevated);
  root.style.setProperty("--gx-accent-fg", accentFg);
  root.style.setProperty("--gx-hot-fg", hotFg);
  root.style.setProperty("--gx-force", String(state.forceColor / 100));
  root.dataset.gxLight = light ? "1" : "0";
  root.dataset.gxCpu = state.cpuLimit < 28 ? "low" : "ok";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      accent: DEFAULT_THEME.accent,
      hot: DEFAULT_THEME.hot,
      bg: DEFAULT_THEME.bg,
      slot: "accent",
      cpuLimit: 80,
      ramLimit: 8,
      netLimit: 70,
      sound: true,
      forceColor: 18,
      setSlot: (slot) => set({ slot }),
      setColor: (slot, hex) => {
        const n = normalizeHex(hex);
        if (!n) return;
        set({ [slot]: n } as Partial<ThemeState>);
        applyToDom(get());
      },
      applyPreset: (preset) => {
        set({ accent: preset.accent, hot: preset.hot, bg: preset.bg });
        applyToDom(get());
      },
      setCpuLimit: (cpuLimit) => {
        set({ cpuLimit });
        applyToDom(get());
      },
      setRamLimit: (ramLimit) => set({ ramLimit }),
      setNetLimit: (netLimit) => set({ netLimit }),
      setSound: (sound) => set({ sound }),
      setForceColor: (forceColor) => {
        set({ forceColor });
        applyToDom(get());
      },
      reset: () => {
        set({
          accent: DEFAULT_THEME.accent,
          hot: DEFAULT_THEME.hot,
          bg: DEFAULT_THEME.bg,
          slot: "accent",
        });
        applyToDom(get());
      },
    }),
    {
      name: "glaxigx-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyToDom(state);
      },
    },
  ),
);

export function paintTheme() {
  applyToDom(useThemeStore.getState());
}
