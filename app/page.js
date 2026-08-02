import Link from "next/link";
import { getVersionList } from "@/lib/almatsurat";
import { pickRandomScene } from "@/lib/background-scenes";

export default function HomePage() {
  const versions = getVersionList();
  const backgroundScene = pickRandomScene("pagi");

  return (
    <main className="site-shell scenic-shell scenic-pagi" style={{ backgroundColor: "#eef4f2" }}>
      <div
        className="scenic-shell-layer scenic-shell-layer-current"
        style={{ backgroundImage: `linear-gradient(rgba(248, 251, 252, 0.72), rgba(248, 251, 252, 0.78)), url(${backgroundScene})` }}
      />
      <div className="site-container mushaf-home" style={{ padding: "40px 0 84px" }}>
        <section className="mushaf-home-hero">
          <div className="mushaf-home-kicker">Mushaf Modern</div>
          <div style={{ display: "grid", gap: 14 }}>
            <h1 className="naskh-text" style={{ margin: 0, fontSize: "clamp(42px, 6vw, 78px)", lineHeight: 1.02 }}>
              Almatsurat Web
            </h1>
            <p className="mushaf-home-copy">
              Bacaan Al-Ma&apos;tsurat Sugro dan Kubro dalam tampilan yang tenang, rapi, dan nyaman untuk dibaca lama
              di layar ponsel.
            </p>
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
