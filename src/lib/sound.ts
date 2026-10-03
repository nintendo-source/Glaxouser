let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export function playUiTone(kind: "click" | "open" | "close" | "nav" = "click") {
  const ac = audio();
  if (!ac) return;
  void ac.resume();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const now = ac.currentTime;
  const map = {
    click: { f: 740, d: 0.06, g: 0.035 },
    open: { f: 520, d: 0.1, g: 0.04 },
    close: { f: 320, d: 0.08, g: 0.03 },
    nav: { f: 880, d: 0.07, g: 0.03 },
  } as const;
  const { f, d, g } = map[kind];
  osc.type = "triangle";
  osc.frequency.setValueAtTime(f, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(80, f * 0.6), now + d);
  gain.gain.setValueAtTime(g, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + d);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(now);
  osc.stop(now + d + 0.02);
}
