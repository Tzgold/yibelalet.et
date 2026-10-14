import type { Metadata } from "next";
import { cookies } from "next/headers";
import { IBM_Plex_Mono, Noto_Sans_Ethiopic, Outfit } from "next/font/google";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LOCALE_COOKIE, parseLocale } from "@/i18n/config";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
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
      className={`${outfit.variable} ${plexMono.variable} ${notoEthiopic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
