"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ZikirCard from "@/components/zikir-card";
import { applyTimeMode } from "@/lib/time-mode";

const MIN_FONT_PT = 1;
const MAX_FONT_PT = 72;
const DEFAULT_FONT_PT = 12;
const SCRIPT_OPTIONS = [
  { value: "uthmani", label: "Mushaf Standard" },
  { value: "indopak", label: "IndoPak" },
  { value: "naskh", label: "Naskh" },
];

function normalizeScript(value) {
  return SCRIPT_OPTIONS.some((option) => option.value === value) ? value : "uthmani";
}

export default function VersionReader({ data, darkMode = false, initialReaderState, onChromeHiddenChange = () => {}, onDarkModeChange = () => {}, onTimeModeChange = () => {}, theme }) {
  const [activeIndex, setActiveIndex] = useState(initialReaderState?.activeIndex ?? 0);
  const [fontSizePt, setFontSizePt] = useState(initialReaderState?.fontSizePt ?? DEFAULT_FONT_PT);
  const [quranScript, setQuranScript] = useState(normalizeScript(initialReaderState?.quranScript));
  const [timeMode, setTimeMode] = useState(initialReaderState?.timeMode ?? "pagi");
  const [navDirection, setNavDirection] = useState("next");
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(initialReaderState?.settingsOpen ?? false);
  const [resetNonce, setResetNonce] = useState(0);
  const [disableTouchSwipe, setDisableTouchSwipe] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const [legacyIosSafariMode, setLegacyIosSafariMode] = useState(false);
  const lastTouchRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedIndex = window.localStorage.getItem(`${data.slug}-active-index`);
    const savedFontSizeMode = window.localStorage.getItem(`${data.slug}-font-size-mode`);
    const savedQuranScript = window.localStorage.getItem(`${data.slug}-quran-script`);
    const savedTimeMode = window.localStorage.getItem(`${data.slug}-time-mode`);

    if (initialReaderState?.hasQueryState) {
      return;
    }

    if (savedIndex) {
      const parsed = Number(savedIndex);
      if (Number.isFinite(parsed) && parsed >= 0 && parsed < data.cards.length) {
        setActiveIndex(parsed);
      }
    }

    const parsedFontPt = Number(savedFontSizeMode);
    if (Number.isFinite(parsedFontPt)) {
      setFontSizePt(Math.min(MAX_FONT_PT, Math.max(MIN_FONT_PT, parsedFontPt)));
    }

    if (savedTimeMode === "pagi" || savedTimeMode === "petang") {
      setTimeMode(savedTimeMode);
    }

    setQuranScript(normalizeScript(savedQuranScript));
  }, [data.cards.length, data.slug, initialReaderState?.hasQueryState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(`${data.slug}-active-index`, String(activeIndex));
  }, [activeIndex, data.slug]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(`${data.slug}-font-size-mode`, String(fontSizePt));
  }, [data.slug, fontSizePt]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(`${data.slug}-quran-script`, quranScript);
  }, [data.slug, quranScript]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(`${data.slug}-time-mode`, timeMode);
  }, [data.slug, timeMode]);

  useEffect(() => {
    onTimeModeChange(timeMode);
  }, [onTimeModeChange, timeMode]);

  useEffect(() => {
    onChromeHiddenChange(false);
    return () => onChromeHiddenChange(false);
  }, [onChromeHiddenChange]);

  useEffect(() => {
    if (!mobileSettingsOpen || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSettingsOpen]);

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    const userAgent = navigator.userAgent;
    const hasTouchPoints = typeof navigator.maxTouchPoints === "number" ? navigator.maxTouchPoints > 0 : false;
    const isAppleTouchDevice = /iPhone|iPad|iPod/i.test(userAgent);
    const isSafariBrowser = /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(userAgent);
    const iosVersionMatch = userAgent.match(/OS (\d+)_/i);
    const iosMajorVersion = iosVersionMatch ? Number(iosVersionMatch[1]) : null;
    setTouchMode(hasTouchPoints || isAppleTouchDevice);
    setDisableTouchSwipe(isAppleTouchDevice && isSafariBrowser);
    setLegacyIosSafariMode(Boolean(isAppleTouchDevice && isSafariBrowser && iosMajorVersion && iosMajorVersion <= 15));
  }, []);

  function bindTouchPress(action) {
    return {
      onClick: () => {
        if (touchMode && Date.now() - lastTouchRef.current < 500) {
          return;
        }
        action();
      },
      onTouchStart: (event) => {
        if (!touchMode) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        lastTouchRef.current = Date.now();
        action();
      },
    };
  }

  function runAsSpa(event, action) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    action();
  }

  function showPrevious() {
    setNavDirection("previous");
    setActiveIndex((current) => (current - 1 + data.cards.length) % data.cards.length);
  }

  function showNext() {
    setNavDirection("next");
    setActiveIndex((current) => (current + 1) % data.cards.length);
  }

  function handleResetAll() {
    if (typeof window === "undefined") {
      return;
    }

    data.cards.forEach((_, index) => {
      window.localStorage.removeItem(`${data.slug}-count-${index}`);
    });

    window.localStorage.setItem(`${data.slug}-active-index`, String(activeIndex));
    setResetNonce((current) => current + 1);
  }

  function decreaseFont() {
    setFontSizePt((current) => Math.max(MIN_FONT_PT, current - 1));
  }

  function increaseFont() {
    setFontSizePt((current) => Math.min(MAX_FONT_PT, current + 1));
  }

  function buildReaderHref(overrides = {}) {
    const params = new URLSearchParams();
    const nextIndex = overrides.activeIndex ?? activeIndex;
    const nextFont = overrides.fontSizePt ?? fontSizePt;
    const nextTimeMode = overrides.timeMode ?? timeMode;
    const nextDarkMode = overrides.darkMode ?? darkMode;
    const nextQuranScript = overrides.quranScript ?? quranScript;
    const nextSettingsOpen = overrides.settingsOpen ?? mobileSettingsOpen;
    const nextCount = overrides.currentCount ?? initialReaderState?.currentCount ?? 0;

    params.set("i", String(nextIndex));
    params.set("font", String(nextFont));
    params.set("mode", nextTimeMode);
    params.set("theme", nextDarkMode ? "dark" : "light");
    params.set("script", nextQuranScript);
    if (nextSettingsOpen) {
      params.set("settings", "1");
    }
    params.set("count", String(nextCount));

    return `/${data.slug}?${params.toString()}`;
  }

  const activeCard = data.cards[activeIndex];
  const progressPercent = ((activeIndex + 1) / data.cards.length) * 100;
  const currentPreview = applyTimeMode(activeCard.entries[0]?.text ?? "", timeMode);
  const morningPreview = applyTimeMode(activeCard.entries[0]?.text ?? "", "pagi");
  const eveningPreview = applyTimeMode(activeCard.entries[0]?.text ?? "", "petang");
  const hasTimeVariant = morningPreview !== eveningPreview;
  const previousHref = buildReaderHref({ activeIndex: (activeIndex - 1 + data.cards.length) % data.cards.length, currentCount: 0 });
  const nextHref = buildReaderHref({ activeIndex: (activeIndex + 1) % data.cards.length, currentCount: 0 });
  const darkToggleHref = buildReaderHref({ darkMode: !darkMode });
  const morningHref = buildReaderHref({ timeMode: "pagi" });
  const eveningHref = buildReaderHref({ timeMode: "petang" });
  const smallerFontHref = buildReaderHref({ fontSizePt: Math.max(MIN_FONT_PT, fontSizePt - 1) });
  const largerFontHref = buildReaderHref({ fontSizePt: Math.min(MAX_FONT_PT, fontSizePt + 1) });
  const settingsHref = buildReaderHref({ settingsOpen: true });
  const closeSettingsHref = buildReaderHref({ settingsOpen: false });
  const resetHref = buildReaderHref({ currentCount: 0, settingsOpen: mobileSettingsOpen });
  const quranScriptLabel = SCRIPT_OPTIONS.find((option) => option.value === quranScript)?.label ?? "Uthmani";

  return (
    <section className={`reader-mode-shell${darkMode ? " reader-dark" : ""}${legacyIosSafariMode ? " reader-legacy-mobile" : ""}`}>
        <div className="reader-mode-toolbar">
          <div className="reader-mode-status">
            <span className="reader-mode-kicker">Mode Fokus</span>
            <div className="reader-mode-meta">
              <span>
                {activeIndex + 1} / {data.cards.length}
              </span>
              <span>{activeCard.titleArabic}</span>
              <span className={`reader-mode-time-pill ${timeMode === "pagi" ? "morning" : "evening"}`}>
                {timeMode === "pagi" ? "Mode Pagi" : "Mode Petang"}
              </span>
            </div>
          </div>

          <Link className="reader-mobile-settings-trigger" href={settingsHref} onClick={(event) => runAsSpa(event, () => setMobileSettingsOpen(true))}>
            <span className="reader-mobile-settings-kicker">Mode Fokus</span>
            <span className="reader-mobile-settings-summary">
              {activeIndex + 1} / {data.cards.length}
              <span className="reader-mobile-settings-dot" aria-hidden="true">
                •
              </span>
              {activeCard.titleArabic}
            </span>
              <span className="reader-mobile-settings-hint">Buka pengaturan</span>
              <span className="reader-mobile-settings-script">{quranScriptLabel}</span>
            </Link>

          <div className="reader-mode-actions">
            <div className="reader-segment">
              <Link className={`reader-segment-button${darkMode ? " active" : ""}`} href={darkToggleHref} onClick={(event) => runAsSpa(event, () => onDarkModeChange(!darkMode))} style={darkMode ? { backgroundColor: theme.darkAccent, color: "white" } : {}}>
                {darkMode ? "Dark On" : "Dark Off"}
              </Link>
            </div>

            <div className="reader-segment">
              <Link className={`reader-segment-button${timeMode === "pagi" ? " active" : ""}`} href={morningHref} onClick={(event) => runAsSpa(event, () => setTimeMode("pagi"))} style={timeMode === "pagi" ? { backgroundColor: darkMode ? theme.darkAccent : theme.accent, color: "white" } : {}}>
                Pagi
              </Link>
              <Link className={`reader-segment-button${timeMode === "petang" ? " active" : ""}`} href={eveningHref} onClick={(event) => runAsSpa(event, () => setTimeMode("petang"))} style={timeMode === "petang" ? { backgroundColor: darkMode ? theme.darkAccent : theme.accent, color: "white" } : {}}>
                Petang
              </Link>
            </div>

            <div className="reader-segment">
              <Link className="reader-segment-button" href={smallerFontHref} onClick={(event) => runAsSpa(event, decreaseFont)} aria-disabled={fontSizePt <= MIN_FONT_PT}>
                Perkecil
              </Link>
              <span className="reader-font-indicator">{fontSizePt}pt</span>
              <Link className="reader-segment-button" href={largerFontHref} onClick={(event) => runAsSpa(event, increaseFont)} aria-disabled={fontSizePt >= MAX_FONT_PT}>
                Perbesar
              </Link>
            </div>

            <Link className="reader-reset" href={resetHref} onClick={(event) => runAsSpa(event, handleResetAll)}>
              Reset semua hitungan
            </Link>
          </div>
        </div>

        {mobileSettingsOpen && !legacyIosSafariMode ? (
          <div className="reader-settings-sheet" role="dialog" aria-modal="true" aria-label="Pengaturan bacaan">
            <Link className="reader-settings-backdrop" href={closeSettingsHref} onClick={(event) => runAsSpa(event, () => setMobileSettingsOpen(false))} aria-label="Tutup pengaturan" />
            <div className="reader-settings-panel">
              <div className="reader-settings-header">
                <div>
                  <span className="reader-settings-kicker">Pengaturan</span>
                  <h2 className="reader-settings-title">Sesuaikan tampilan baca</h2>
                </div>
                <Link className="reader-settings-close" href={closeSettingsHref} onClick={(event) => runAsSpa(event, () => setMobileSettingsOpen(false))}>
                  Tutup
                </Link>
              </div>

              <div className="reader-settings-group">
                <span className="reader-settings-label">Mode tampilan</span>
                <div className="reader-segment reader-settings-segment">
                  <Link
                    className={`reader-segment-button${darkMode ? " active" : ""}`}
                    href={darkToggleHref}
                    onClick={(event) => runAsSpa(event, () => onDarkModeChange(!darkMode))}
                    style={darkMode ? { backgroundColor: theme.darkAccent, color: "white" } : {}}
                  >
                    {darkMode ? "Dark On" : "Dark Off"}
                  </Link>
                </div>
              </div>

              <div className="reader-settings-group">
                <span className="reader-settings-label">Waktu baca</span>
                <div className="reader-segment reader-settings-segment">
                  <Link
                    className={`reader-segment-button${timeMode === "pagi" ? " active" : ""}`}
                    href={morningHref}
                    onClick={(event) => runAsSpa(event, () => setTimeMode("pagi"))}
                    style={timeMode === "pagi" ? { backgroundColor: darkMode ? theme.darkAccent : theme.accent, color: "white" } : {}}
                  >
                    Pagi
                  </Link>
                  <Link
                    className={`reader-segment-button${timeMode === "petang" ? " active" : ""}`}
                    href={eveningHref}
                    onClick={(event) => runAsSpa(event, () => setTimeMode("petang"))}
                    style={timeMode === "petang" ? { backgroundColor: darkMode ? theme.darkAccent : theme.accent, color: "white" } : {}}
                  >
                    Petang
                  </Link>
                </div>
              </div>

              <div className="reader-settings-group">
                <span className="reader-settings-label">Gaya script Qur'an</span>
                <div className="reader-segment reader-settings-segment">
                  {SCRIPT_OPTIONS.map((option) => (
                    <Link
                      className={`reader-segment-button${quranScript === option.value ? " active" : ""}`}
                      href={buildReaderHref({ quranScript: option.value })}
                      key={option.value}
                      onClick={(event) => runAsSpa(event, () => setQuranScript(option.value))}
                      style={quranScript === option.value ? { backgroundColor: darkMode ? theme.darkAccent : theme.accent, color: "white" } : {}}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="reader-settings-group">
                <span className="reader-settings-label">Ukuran huruf</span>
                <div className="reader-settings-font-row">
                  <Link className="reader-segment-button reader-settings-font-button" href={smallerFontHref} onClick={(event) => runAsSpa(event, decreaseFont)} aria-disabled={fontSizePt <= MIN_FONT_PT}>
                    Perkecil
                  </Link>
                  <span className="reader-font-indicator reader-settings-font-indicator">{fontSizePt}pt</span>
                  <Link className="reader-segment-button reader-settings-font-button" href={largerFontHref} onClick={(event) => runAsSpa(event, increaseFont)} aria-disabled={fontSizePt >= MAX_FONT_PT}>
                    Perbesar
                  </Link>
                </div>
              </div>

              <Link className="reader-reset reader-settings-reset" href={resetHref} onClick={(event) => runAsSpa(event, handleResetAll)}>
                Reset semua hitungan
              </Link>
            </div>
          </div>
        ) : null}

        <div className="reader-mode-progress">
          <div className="reader-mode-progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: darkMode ? theme.darkAccent : theme.accentStrong }} />
        </div>

        <div className="reader-mode-frame" style={{ borderColor: darkMode ? `${theme.darkAccent}20` : `${theme.accent}18` }}>
          <div className="reader-mode-nav">
            <div className="reader-mode-nav-center">
              <span className="reader-mode-nav-title naskh-text" style={{ color: darkMode ? theme.darkAccent : theme.accent }}>
                {theme.title}
              </span>
              <span className="reader-mode-nav-help">Gunakan tombol bawah untuk pindah bacaan</span>
            </div>
          </div>

          {activeCard.scriptType === "doa" ? (
            <div className="reader-mode-variant-preview" style={{ color: darkMode ? `${theme.darkAccent}d0` : `${theme.accent}bb` }}>
              {hasTimeVariant ? (
                <>
                  Redaksi aktif: {currentPreview.slice(0, 72)}
                  {currentPreview.length > 72 ? "..." : ""}
                </>
              ) : (
                <>Bacaan ini sama untuk mode pagi dan petang.</>
              )}
            </div>
          ) : null}

          <div
            className={`reader-card-stage ${navDirection === "previous" ? "is-from-previous" : "is-from-next"}`}
            key={`${activeCard.titleArabic}-${activeIndex}-${timeMode}`}
          >
            <ZikirCard
              card={activeCard}
              currentCount={initialReaderState?.currentCount ?? 0}
              darkMode={darkMode}
              fontSizePt={fontSizePt}
              index={activeIndex}
              legacyHrefBuilder={buildReaderHref}
              legacyMode={legacyIosSafariMode}
              preferInitialCount={initialReaderState?.hasCountQuery}
              quranScript={quranScript}
              readerMode
              resetNonce={resetNonce}
              storageKey={`${data.slug}-count-${activeIndex}`}
              touchMode={touchMode}
              theme={theme}
              timeMode={timeMode}
            />
          </div>
        </div>

        <div className="reader-bottom-nav">
          <Link className="reader-mode-nav-button" href={previousHref} onClick={(event) => runAsSpa(event, showPrevious)}>
            Sebelumnya
          </Link>
          <Link className="reader-mode-nav-button" href={nextHref} onClick={(event) => runAsSpa(event, showNext)}>
            Berikutnya
          </Link>
        </div>
      </section>
  );
}
