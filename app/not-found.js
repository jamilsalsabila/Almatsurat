import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="site-shell" style={{ background: "linear-gradient(180deg, #f4f7f8 0%, #edf1f2 100%)" }}>
      <div className="site-container empty-state">
        <h1 style={{ marginBottom: 12 }}>Halaman tidak ditemukan</h1>
        <p style={{ marginTop: 0, color: "rgba(17,17,17,0.62)" }}>Coba kembali ke beranda atau buka versi Sugro dan Kubro.</p>
        <Link className="landing-link" href="/">
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
