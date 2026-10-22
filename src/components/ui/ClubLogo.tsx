import Image from "next/image";

export function ClubLogo({
  name,
  logoUrl,
  size = 40,
  loading = "lazy",
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
  loading?: "eager" | "lazy";
}) {
  if (!logoUrl) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full bg-[var(--bg-soft)] text-[10px] font-bold text-[var(--text-dim)] ring-1 ring-[var(--border)]"
        style={{ width: size, height: size }}
        aria-hidden
      >
        {name.slice(0, 3).toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Image
        src={logoUrl}
        alt={`${name} crest`}
        width={size}
        height={size}
        className="object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
        loading={loading}
        unoptimized
      />
    </span>
  );
}
