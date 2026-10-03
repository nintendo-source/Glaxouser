import { useEffect, useState } from "react";
import { hostnameOf } from "@/lib/browse";
import { cn } from "@/lib/utils";

function googleIcon(host: string, px: number) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${px}`;
}

function duckIcon(host: string) {
  return `https://icons.duckduckgo.com/ip3/${host}.ico`;
}

export function SiteIcon({
  url,
  size = 32,
  className,
}: {
  url: string;
  size?: number;
  className?: string;
}) {
  const host = hostnameOf(url);
  const fetchSize = size >= 24 ? 128 : 64;
  const [src, setSrc] = useState(host ? googleIcon(host, fetchSize) : "");
  const [stage, setStage] = useState<"g" | "d" | "letter">(host ? "g" : "letter");

  useEffect(() => {
    if (!host) {
      setSrc("");
      setStage("letter");
      return;
    }
    setSrc(googleIcon(host, fetchSize));
    setStage("g");
  }, [host, fetchSize]);

  const letter = (host || "?").charAt(0).toUpperCase();

  if (!host || stage === "letter") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[var(--radius-xs)] bg-gx-accent-soft font-display font-semibold text-gx-accent",
          className,
        )}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.42) }}
        aria-hidden
      >
        {letter}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-[2px] object-contain", className)}
      style={{ width: size, height: size }}
      onError={() => {
        if (stage === "g") {
          setSrc(duckIcon(host));
          setStage("d");
        } else {
          setStage("letter");
        }
      }}
    />
  );
}
