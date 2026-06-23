import Link from "next/link";
import { getVersionList } from "@/lib/almatsurat";

export default function HomePage() {
  const versions = getVersionList();

  return (
    <main className="site-shell" style={{ background: "linear-gradient(180deg, #f1f5f6 0%, #f4f1eb 100%)" }}>
      <div className="site-container mushaf-home" style={{ padding: "40px 0 84px" }}>
        <section className="mushaf-home-hero">
          <div className="mushaf-home-kicker">Mushaf Modern</div>
          <div className="mushaf-home-grid">
            <div style={{ display: "grid", gap: 14 }}>
              <h1 className="naskh-text" style={{ margin: 0, fontSize: "clamp(42px, 6vw, 78px)", lineHeight: 1.02 }}>
                Almatsurat Web
              </h1>
              <p className="mushaf-home-copy">
                Bacaan Al-Ma&apos;tsurat Sugro dan Kubro dalam tampilan yang tenang, rapi, dan nyaman untuk dibaca lama
                di layar ponsel.
              </p>
            </div>

            <div className="mushaf-home-note">
              <div className="mushaf-home-note-mark">۞</div>
              <p>
                Dirancang dengan fokus pada tipografi Arab, ritme bacaan, dan pengalaman visual yang lebih dekat ke lembar
                mushaf modern daripada halaman artikel biasa.
              </p>
            </div>
          </div>
        </section>

        <section className="mushaf-home-section-head">
          <span className="mushaf-home-section-label">Pilih versi bacaan</span>
          <div className="mushaf-home-section-line" />
        </section>

        <section className="grid-two mushaf-home-grid-two">
          {versions.map((version) => (
            <article className="landing-card mushaf-home-card" key={version.slug} style={{ borderColor: `${version.accent}18` }}>
              <div className="mushaf-home-card-top">
                <span className="landing-chip mushaf-home-chip" style={{ backgroundColor: `${version.accent}14`, color: version.accent }}>
                  {version.label}
                </span>
                <span className="mushaf-home-card-mark" style={{ color: `${version.accent}88` }}>
                  ۞
                </span>
              </div>
              <h2 className="naskh-text mushaf-home-card-title" style={{ color: version.accent }}>
                {version.title}
              </h2>
              <p className="mushaf-home-card-copy">{version.subtitle}</p>
              <Link className="landing-link mushaf-home-link" href={`/${version.slug}`} style={{ color: version.accent }}>
                Buka bacaan
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
