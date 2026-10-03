const BLOCKED_HOSTS = [
  "x.com",
  "twitter.com",
  "reddit.com",
  "instagram.com",
  "facebook.com",
  "github.com",
  "discord.com",
  "twitch.tv",
  "netflix.com",
  "spotify.com",
  "tiktok.com",
  "linkedin.com",
];

export const YT_CHANNEL = "https://www.youtube.com/@Glaxiblade";
export const YT_SUBSCRIBE = "https://www.youtube.com/@Glaxiblade?sub_confirmation=1";

export function isProbablyUrl(input: string): boolean {
  const v = input.trim();
  if (!v) return false;
  if (/^https?:\/\//i.test(v)) return true;
  if (/^localhost(:\d+)?(\/|$)/i.test(v)) return true;
  if (/\s/.test(v)) return false;
  return /^(?:[\w-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#].*)?$/i.test(v);
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function titleFromUrl(url: string): string {
  if (!url) return "New tab";
  try {
    const u = new URL(url);
    const q = u.searchParams.get("q") || u.searchParams.get("list");
    if (q && (u.hostname.includes("google") || u.hostname.includes("youtube"))) {
      return q;
    }
    if (u.hostname.includes("wikipedia.org")) {
      const last = u.pathname.split("/").filter(Boolean).pop();
      if (last && last !== "wiki") return decodeURIComponent(last.replaceAll("_", " "));
    }
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "Tab";
  }
}

export function youtubeId(input: string): string | null {
  const m = input.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  );
  return m?.[1] ?? null;
}

export function toBrowseUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const yt = youtubeId(trimmed);
  if (yt) return `https://www.youtube.com/embed/${yt}`;

  if (/youtube\.com\/@/i.test(trimmed) || /youtube\.com\/channel\//i.test(trimmed)) {
    const handle = trimmed.match(/youtube\.com\/@([\w.-]+)/i)?.[1] ?? "Glaxiblade";
    return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(handle)}`;
  }

  if (isProbablyUrl(trimmed)) {
    let url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const u = new URL(url);
      if (u.hostname.replace(/^www\./, "") === "google.com" && !u.searchParams.has("igu")) {
        u.searchParams.set("igu", "1");
        url = u.toString();
      }
      if (u.hostname.includes("youtube.com") && u.pathname === "/") {
        return "https://www.youtube.com/embed?listType=search&list=gaming";
      }
    } catch {
      /* keep */
    }
    return url;
  }

  return `https://www.google.com/search?igu=1&q=${encodeURIComponent(trimmed)}`;
}

export function googleHome(): string {
  return "https://www.google.com/webhp?igu=1";
}

export function hostLikelyBlocked(url: string): boolean {
  const host = hostnameOf(url);
  if (!host) return false;
  return BLOCKED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

export function faviconFor(url: string, size = 64): string | null {
  const host = hostnameOf(url);
  if (!host) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`;
}
