"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

type Status = {
  followerCount: number;
  following: boolean;
  subscribed: boolean;
};

export function FollowSubscribeBar({
  slug,
  displayName,
  initialStatus,
  subscribePriceEtb,
  subscribeDays = 30,
  hasBettingRecords = true,
  checkoutPreview = false,
}: {
  slug: string;
  displayName: string;
  initialStatus: Status;
  subscribePriceEtb: number;
  subscribeDays?: number;
  hasBettingRecords?: boolean;
  checkoutPreview?: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [statusOverride, setStatusOverride] = useState<{ base: Status; value: Status } | null>(null);
  const status = statusOverride?.base === initialStatus ? statusOverride.value : initialStatus;
  const [bump, setBump] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirmOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [confirmOpen]);

  async function onFollow() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      }).catch(() => null);
      if (!res) {
        setError(t("social.networkError"));
        return;
      }
      const data = (await res.json().catch(() => ({}))) as Status & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not update follow");
        return;
      }
      setStatusOverride({ base: initialStatus, value: { ...status, following: data.following, followerCount: data.followerCount } });
      setBump(true);
      window.setTimeout(() => setBump(false), 350);
      router.refresh();
    });
  }

  async function startChapaCheckout() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/chapa/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      }).catch(() => null);
      if (!res) {
        setError(t("social.networkError"));
        return;
      }
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        checkoutUrl?: string;
        mock?: boolean;
      };
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "Could not start Chapa payment");
        return;
      }
      window.location.href = data.checkoutUrl;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <p
            className={`text-2xl font-bold tabular tracking-tight transition-transform ${
              bump ? "scale-110 text-[var(--accent)]" : "text-[var(--text)]"
            }`}
          >
            {status.followerCount.toLocaleString()}
          </p>
          <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
            {t("social.followers")}
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular tracking-tight text-[var(--text)]">
            {status.subscribed ? t("social.on") : t("social.off")}
          </p>
          <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
            {t("social.bettingAccess")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onFollow}
          className={`focus-ring relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-semibold transition active:scale-[0.97] disabled:opacity-60 ${
            status.following
              ? "border border-[var(--border-strong)] bg-transparent text-[var(--text)] hover:border-[var(--negative)] hover:text-[var(--negative)]"
              : "bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_0_24px_rgba(245,158,11,0.25)] hover:brightness-105"
          }`}
        >
          {status.following ? t("social.following") : t("social.follow")}
        </button>

        {status.subscribed ? (
          <span className="inline-flex items-center rounded-full border border-[rgba(62,207,142,0.4)] bg-[var(--positive-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--positive)]">
            {t("social.subscribed")}
          </span>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmOpen(true)}
            className="focus-ring rounded-full border border-[var(--accent)] bg-black px-5 py-2.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)] active:scale-[0.97] disabled:opacity-60"
          >
            {checkoutPreview ? t('social.testSubscribe') : t("social.subscribe", { price: subscribePriceEtb })}
          </button>
        )}
      </div>

      <p className="text-xs text-[var(--text-dim)]">
        {status.subscribed
          ? t("social.subscribedHint", { name: displayName })
          : t("social.followHint", { name: displayName })}
      </p>
      {hasBettingRecords ? null : <p className="text-xs text-[var(--text-dim)]">{t("social.noBettingYet")}</p>}
      {error ? (
        <p className="text-xs text-[var(--negative)]" role="alert">
          {error}
        </p>
      ) : null}

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chapa-subscribe-title"
            onKeyDown={(event) => {
              if (event.key === "Escape" && !pending) {
                event.preventDefault();
                setConfirmOpen(false);
              }
              if (event.key !== "Tab") return;
              const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
              if (!buttons?.length) { event.preventDefault(); return; }
              const first = buttons[0];
              const last = buttons[buttons.length - 1];
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
              else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }}
            className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[#0a0a0a] p-5 shadow-2xl"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              {t(checkoutPreview ? 'social.previewCheckout' : "social.chapaCheckout")}
            </p>
            <h3 id="chapa-subscribe-title" className="mt-2 text-xl font-semibold">
              {t("social.unlockTips")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {t(checkoutPreview ? 'social.previewHint' : "social.payFor", {
                price: subscribePriceEtb,
                days: subscribeDays,
                name: displayName,
              })}
            </p>
            {checkoutPreview ? null : <ol className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
              <li>{t("social.step1")}</li>
              <li>{t("social.step2")}</li>
              <li>{t("social.step3")}</li>
            </ol>}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                disabled={pending}
                onClick={startChapaCheckout}
                className="focus-ring flex-1 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-ink)] disabled:opacity-60"
              >
                {pending ? t("social.openingChapa") : t(checkoutPreview ? 'social.activateTest' : "social.continueChapa")}
              </button>
              <button
                ref={cancelRef}
                type="button"
                disabled={pending}
                onClick={() => setConfirmOpen(false)}
                className="focus-ring flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-muted)]"
              >
                {t("social.cancel")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
