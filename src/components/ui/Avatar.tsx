"use client";

import { useState } from "react";
import { initials } from "@/lib/format";

export function Avatar({
  name,
  url,
  size = "md",
}: {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const dim = size === "sm" ? "h-9 w-9 text-xs" : size === "lg" ? "h-16 w-16 text-lg" : "h-11 w-11 text-sm";
  if (url && url !== failedUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(url)}
        className={`${dim} shrink-0 rounded-full object-cover ring-1 ring-[var(--border)]`}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-[var(--bg-soft)] font-semibold text-[var(--text-muted)] ring-1 ring-[var(--border)]`}
    >
      {initials(name)}
    </div>
  );
}
