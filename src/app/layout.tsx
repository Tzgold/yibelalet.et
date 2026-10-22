import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Barlow_Condensed, IBM_Plex_Mono, Inter, Noto_Sans_Ethiopic } from "next/font/google";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LOCALE_COOKIE, parseLocale } from "@/i18n/config";
import "./globals.css";
import "./landing.css";
import "./design-system.css";
import "./workspace.css";

// Locale selection reads the request cookie, including on legal and error pages.
export const instant = false;

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const notoEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  weight: ["400", "500", "600", "700"],
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
