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

export const metadata = {
  title: "Almatsurat Web",
  description: "Versi website Almatsurat Sugro dan Kubro berbasis Next.js, siap deploy ke Vercel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${uthmani.variable} ${naskh.variable}`}>{children}</body>
    </html>
  );
}
