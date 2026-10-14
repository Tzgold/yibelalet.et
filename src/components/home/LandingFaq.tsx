"use client";

import Link from "next/link";
import { useState } from "react";
import { useT } from "@/i18n/I18nProvider";

export function LandingFaq() {
  const t = useT();
  const [open, setOpen] = useState<number | null>(0);

  const items = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
  ];

  return (
    <section id="faq" className="scroll-mt-20 py-10">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0a0c10]">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[rgba(245,158,11,0.14)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[rgba(91,141,239,0.08)] blur-3xl"
        />

        <div className="relative grid gap-10 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-14 lg:px-12 lg:py-14">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
              {t("faq.eyebrow")}
            </p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl sm:leading-[1.12]">
              {t("faq.title")}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--text-muted)] sm:text-[15px]">
              {t("faq.subtitle")}
            </p>
            <div className="mt-8">
              <Link
                href="/signin"
                className="focus-ring relative inline-flex rounded-full p-[1.5px] shadow-[0_0_24px_rgba(245,158,11,0.22),0_0_40px_rgba(225,29,72,0.1)] transition hover:shadow-[0_0_28px_rgba(245,158,11,0.32),0_0_48px_rgba(225,29,72,0.16)]"
                style={{
                  background:
                    "linear-gradient(105deg, #f59e0b 0%, #f97316 45%, #e11d48 100%)",
                }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-[#12151a] px-5 py-2.5 text-sm font-semibold text-[var(--text)]">
                  {t("faq.cta")}
                </span>
              </Link>
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            {items.map((item, index) => {
              const isOpen = open === index;
              return (
                <li
                  key={item.q}
                  className={`rounded-xl border transition ${
                    isOpen
                      ? "border-[rgba(245,158,11,0.35)] bg-[linear-gradient(180deg,rgba(28,24,18,0.95),rgba(14,16,20,0.98))] shadow-[0_0_0_1px_rgba(245,158,11,0.08),0_12px_40px_rgba(0,0,0,0.35)]"
                      : "border-[var(--border)] bg-[linear-gradient(180deg,rgba(22,25,32,0.95),rgba(12,14,18,0.98))] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="focus-ring flex w-full items-center justify-between gap-4 rounded-xl px-5 py-4 text-left"
                  >
                    <span className="text-[15px] font-medium leading-snug text-[var(--text)]">
                      {item.q}
                    </span>
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition ${
                        isOpen
                          ? "rotate-180 border-[rgba(245,158,11,0.4)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : ""
                      }`}
                      aria-hidden
                    >
                      <ChevronDown />
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm leading-relaxed text-[var(--text-muted)]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
