import localFont from "next/font/local";
import "./globals.css";

const uthmani = localFont({
  src: "../public/fonts/KFGQPCUthmanicScriptHAFS.otf",
  variable: "--font-uthmani",
  display: "swap",
});

const naskh = localFont({
  src: "../public/fonts/NotoNaskhArabic-Regular.ttf",
  variable: "--font-naskh",
  display: "swap",
});

const SITE_URL = "https://almatsurat-zeta.vercel.app";
const SITE_DESCRIPTION =
  "Bacaan Al-Ma'tsurat Sugro dan Kubro dalam tampilan yang tenang, rapi, dan nyaman untuk dibaca lama di layar ponsel.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Almatsurat Web — Bacaan Al-Ma'tsurat Sugro & Kubro",
    template: "%s | Almatsurat Web",
  },
  description: SITE_DESCRIPTION,
  keywords: ["Al-Ma'tsurat", "Almatsurat", "wazifah", "dzikir pagi petang", "Sugro", "Kubro", "Hasan Al-Banna"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "Almatsurat Web",
    title: "Almatsurat Web — Bacaan Al-Ma'tsurat Sugro & Kubro",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Almatsurat Web — Bacaan Al-Ma'tsurat Sugro & Kubro",
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${uthmani.variable} ${naskh.variable}`}>{children}</body>
    </html>
  );
}
