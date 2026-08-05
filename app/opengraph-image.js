import { ImageResponse } from "next/og";

export const alt = "Almatsurat Web — Bacaan Al-Ma'tsurat Sugro dan Kubro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundImage: "linear-gradient(135deg, #0f3d3e 0%, #1a5660 45%, #b16a3f 100%)",
          color: "#ffffff",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "rgba(255,255,255,0.16)",
            border: "2px solid rgba(255,255,255,0.4)",
            fontSize: 44,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          A
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
          Almatsurat Web
        </div>
        <div style={{ display: "flex", fontSize: 34, opacity: 0.88, marginTop: 24, maxWidth: 820 }}>
          Bacaan Al-Ma&apos;tsurat Sugro &amp; Kubro — tampilan tenang, rapi, dan nyaman untuk dibaca lama di layar ponsel.
        </div>
      </div>
    ),
    { ...size }
  );
}
