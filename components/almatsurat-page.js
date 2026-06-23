import Link from "next/link";
import { getVersionList } from "@/lib/almatsurat";

export default function AlmatsuratPage({ children, chromeHidden = false, data, theme, darkMode = false }) {
  const versions = getVersionList();

  return (
    <main
      className={`site-shell${darkMode ? " page-dark" : ""}`}
      style={{ background: darkMode ? theme.darkBackground : theme.background, color: darkMode ? theme.darkText : theme.text }}
    >
      <div className="site-container version-page">
        <div className={`topbar mushaf-topbar${chromeHidden ? " chrome-hidden" : ""}`}>
          <Link className="brand-link" href="/">
            <span
              className="brand-mark mushaf-brand-mark"
              style={{
                color: darkMode ? theme.darkAccent : theme.accent,
                borderColor: darkMode ? `${theme.darkAccent}44` : `${theme.accent}33`,
              }}
            >
              م
            </span>
            <span className="mushaf-brand-text">Almatsurat</span>
          </Link>

          <nav className="version-switcher mushaf-version-switcher">
            {versions.map((version) => {
              const active = version.slug === theme.slug;
              return (
                <Link
                  className={`version-link${active ? " active" : ""}`}
                  href={`/${version.slug}`}
                  key={version.slug}
                  style={active ? { backgroundColor: darkMode ? version.darkAccent : version.accent, borderColor: darkMode ? version.darkAccent : version.accent, color: "white" } : {}}
                >
                  {version.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`header-stack mushaf-header-stack${chromeHidden ? " chrome-hidden" : ""}`}>
          <section className="mushaf-hero" style={{ borderColor: darkMode ? `${theme.darkAccent}2c` : `${theme.accent}22` }}>
            <div className="mushaf-hero-top">
              <div className="mushaf-eyebrow" style={{ color: darkMode ? theme.darkAccent : theme.accent }}>
                ورد يومي
              </div>
              <div className="mushaf-collection-meta">
                <span>{data.cards.length} bacaan</span>
              </div>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <h1 className="naskh-text mushaf-title" style={{ color: darkMode ? theme.darkAccent : theme.accent }}>
                {theme.title}
              </h1>
              <p className="mushaf-subtitle">{theme.subtitle}</p>
            </div>
          </section>

          {data.intro?.arabic ? (
            <section className="intro-card mushaf-intro-card" style={{ borderColor: darkMode ? `${theme.darkAccent}24` : `${theme.accent}18` }}>
              <p className="arabic-intro">{data.intro.arabic}</p>
              {data.intro.translation ? <p className="intro-translation">{data.intro.translation}</p> : null}
            </section>
          ) : null}
        </div>

        {children}
      </div>
    </main>
  );
}
