"use client";

import { useEffect, useRef, useState } from "react";
import ZikirCard from "@/components/zikir-card";
import { applyTimeMode } from "@/lib/time-mode";

const MIN_FONT_PT = 1;
const MAX_FONT_PT = 72;
const DEFAULT_FONT_PT = 12;

export default function VersionReader({ data, darkMode = false, onChromeHiddenChange = () => {}, onDarkModeChange = () => {}, theme }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fontSizePt, setFontSizePt] = useState(DEFAULT_FONT_PT);
  const [timeMode, setTimeMode] = useState("pagi");
  const [navDirection, setNavDirection] = useState("next");
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
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
    const savedTimeMode = window.localStorage.getItem(`${data.slug}-time-mode`);

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

  }, [data.cards.length, data.slug]);

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
    window.localStorage.setItem(`${data.slug}-time-mode`, timeMode);
  }, [data.slug, timeMode]);

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
    window.location.reload();
  }

  function decreaseFont() {
    setFontSizePt((current) => Math.max(MIN_FONT_PT, current - 1));
  }

  function increaseFont() {
    setFontSizePt((current) => Math.min(MAX_FONT_PT, current + 1));
  }

  const activeCard = data.cards[activeIndex];
  const progressPercent = ((activeIndex + 1) / data.cards.length) * 100;
  const currentPreview = applyTimeMode(activeCard.entries[0]?.text ?? "", timeMode);
  const morningPreview = applyTimeMode(activeCard.entries[0]?.text ?? "", "pagi");
  const eveningPreview = applyTimeMode(activeCard.entries[0]?.text ?? "", "petang");
  const hasTimeVariant = morningPreview !== eveningPreview;

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

          <button className="reader-mobile-settings-trigger" {...bindTouchPress(() => setMobileSettingsOpen(true))} type="button">
            Pengaturan
          </button>

          <div className="reader-mode-actions">
            <div className="reader-segment">
              <button
                className={`reader-segment-button${darkMode ? " active" : ""}`}
                {...bindTouchPress(() => onDarkModeChange(!darkMode))}
                style={darkMode ? { backgroundColor: theme.darkAccent, color: "white" } : {}}
                type="button"
              >
                {darkMode ? "Dark On" : "Dark Off"}
              </button>
            </div>

            <div className="reader-segment">
              <button
                className={`reader-segment-button${timeMode === "pagi" ? " active" : ""}`}
                {...bindTouchPress(() => setTimeMode("pagi"))}
                style={timeMode === "pagi" ? { backgroundColor: darkMode ? theme.darkAccent : theme.accent, color: "white" } : {}}
                type="button"
              >
                Pagi
              </button>
              <button
                className={`reader-segment-button${timeMode === "petang" ? " active" : ""}`}
                {...bindTouchPress(() => setTimeMode("petang"))}
                style={timeMode === "petang" ? { backgroundColor: darkMode ? theme.darkAccent : theme.accent, color: "white" } : {}}
                type="button"
              >
                Petang
              </button>
            </div>

            <div className="reader-segment">
              <button className="reader-segment-button" disabled={fontSizePt <= MIN_FONT_PT} {...bindTouchPress(decreaseFont)} type="button">
                Perkecil
              </button>
              <span className="reader-font-indicator">{fontSizePt}pt</span>
              <button className="reader-segment-button" disabled={fontSizePt >= MAX_FONT_PT} {...bindTouchPress(increaseFont)} type="button">
                Perbesar
              </button>
            </div>

            <button className="reader-reset" {...bindTouchPress(handleResetAll)} type="button">
              Reset semua hitungan
            </button>
          </div>
        </div>

        {mobileSettingsOpen && !legacyIosSafariMode ? (
          <div className="reader-settings-sheet" role="dialog" aria-modal="true" aria-label="Pengaturan bacaan">
            <button className="reader-settings-backdrop" {...bindTouchPress(() => setMobileSettingsOpen(false))} type="button" aria-label="Tutup pengaturan" />
            <div className="reader-settings-panel">
              <div className="reader-settings-header">
                <div>
                  <span className="reader-settings-kicker">Pengaturan</span>
                  <h2 className="reader-settings-title">Sesuaikan tampilan baca</h2>
                </div>
                <button className="reader-settings-close" {...bindTouchPress(() => setMobileSettingsOpen(false))} type="button">
                  Tutup
                </button>
              </div>

              <div className="reader-settings-group">
                <span className="reader-settings-label">Mode tampilan</span>
                <div className="reader-segment reader-settings-segment">
                  <button
                    className={`reader-segment-button${darkMode ? " active" : ""}`}
                    {...bindTouchPress(() => onDarkModeChange(!darkMode))}
                    style={darkMode ? { backgroundColor: theme.darkAccent, color: "white" } : {}}
                    type="button"
                  >
                    {darkMode ? "Dark On" : "Dark Off"}
                  </button>
                </div>
              </div>

              <div className="reader-settings-group">
                <span className="reader-settings-label">Waktu baca</span>
                <div className="reader-segment reader-settings-segment">
                  <button
                    className={`reader-segment-button${timeMode === "pagi" ? " active" : ""}`}
                    {...bindTouchPress(() => setTimeMode("pagi"))}
                    style={timeMode === "pagi" ? { backgroundColor: darkMode ? theme.darkAccent : theme.accent, color: "white" } : {}}
                    type="button"
                  >
                    Pagi
                  </button>
                  <button
                    className={`reader-segment-button${timeMode === "petang" ? " active" : ""}`}
                    {...bindTouchPress(() => setTimeMode("petang"))}
                    style={timeMode === "petang" ? { backgroundColor: darkMode ? theme.darkAccent : theme.accent, color: "white" } : {}}
                    type="button"
                  >
                    Petang
                  </button>
                </div>
              </div>

              <div className="reader-settings-group">
                <span className="reader-settings-label">Ukuran huruf</span>
                <div className="reader-settings-font-row">
                  <button className="reader-segment-button reader-settings-font-button" disabled={fontSizePt <= MIN_FONT_PT} {...bindTouchPress(decreaseFont)} type="button">
                    Perkecil
                  </button>
                  <span className="reader-font-indicator reader-settings-font-indicator">{fontSizePt}pt</span>
                  <button className="reader-segment-button reader-settings-font-button" disabled={fontSizePt >= MAX_FONT_PT} {...bindTouchPress(increaseFont)} type="button">
                    Perbesar
                  </button>
                </div>
              </div>

              <button className="reader-reset reader-settings-reset" {...bindTouchPress(handleResetAll)} type="button">
                Reset semua hitungan
              </button>
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
              darkMode={darkMode}
              fontSizePt={fontSizePt}
              index={activeIndex}
              readerMode
              storageKey={`${data.slug}-count-${activeIndex}`}
              touchMode={touchMode}
              theme={theme}
              timeMode={timeMode}
            />
          </div>
        </div>

        <div className="reader-bottom-nav">
          <button className="reader-mode-nav-button" {...bindTouchPress(showPrevious)} type="button">
            Sebelumnya
          </button>
          <button className="reader-mode-nav-button" {...bindTouchPress(showNext)} type="button">
            Berikutnya
          </button>
        </div>
      </section>
  );
}
