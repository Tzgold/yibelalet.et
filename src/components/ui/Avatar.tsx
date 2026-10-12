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
  const dim = size === "sm" ? "h-9 w-9 text-xs" : size === "lg" ? "h-16 w-16 text-lg" : "h-11 w-11 text-sm";
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={`${dim} rounded-full object-cover ring-1 ring-[var(--border)]`}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={`${dim} flex items-center justify-center rounded-full bg-[var(--bg-soft)] font-semibold text-[var(--text-muted)] ring-1 ring-[var(--border)]`}
    >
      {initials(name)}
    </div>
  );
}
