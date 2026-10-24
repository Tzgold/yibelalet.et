import type { Metadata } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LOCALE_COOKIE, parseLocale } from "@/i18n/config";
import "./globals.css";
import "./landing.css";
import "./design-system.css";
import "./workspace.css";

// Locale selection reads the request cookie, including on legal and error pages.
export const instant = false;

const inter = localFont({
  src: "./fonts/inter/Inter-Variable.ttf",
  variable: "--font-body",
  weight: "100 900",
  display: "swap",
});

const display = localFont({
  src: [
    { path: "./fonts/barlowcondensed/BarlowCondensed-SemiBold.ttf", weight: "600" },
    { path: "./fonts/barlowcondensed/BarlowCondensed-Bold.ttf", weight: "700" },
  ],
  variable: "--font-display",
  display: "swap",
});

const plexMono = localFont({
  src: [
    { path: "./fonts/ibmplexmono/IBMPlexMono-Regular.ttf", weight: "400" },
    { path: "./fonts/ibmplexmono/IBMPlexMono-Medium.ttf", weight: "500" },
    { path: "./fonts/ibmplexmono/IBMPlexMono-SemiBold.ttf", weight: "600" },
  ],
  variable: "--font-plex",
  preload: false,
  display: "swap",
});

const notoEthiopic = localFont({
  src: "./fonts/notosansethiopic/NotoSansEthiopic-Variable.ttf",
  variable: "--font-ethiopic",
  weight: "100 900",
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yibelalet · Football prediction analytics",
  description:
    "Compare human tipsters and AI models using timestamped football predictions and historical performance.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${display.variable} ${plexMono.variable} ${notoEthiopic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
