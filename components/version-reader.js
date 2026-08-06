"use client";

import { useEffect, useRef, useState } from "react";
import ZikirCard from "@/components/zikir-card";

const MIN_FONT_PT = 1;
const MAX_FONT_PT = 72;
const DEFAULT_FONT_PT = 12;
const SWIPE_MIN_DISTANCE = 48;
const SCRIPT_OPTIONS = [
  { value: "uthmani", label: "Mushaf Standard" },
  { value: "indopak", label: "IndoPak" },
  { value: "naskh", label: "Naskh" },
];

function normalizeScript(value) {
  return SCRIPT_OPTIONS.some((option) => option.value === value) ? value : "uthmani";
}

export default function VersionReader({ data, darkMode = false, initialReaderState, onChromeHiddenChange = () => {}, onClose = () => {}, onDarkModeChange = () => {}, onTimeModeChange = () => {}, theme }) {
  const [activeIndex, setActiveIndex] = useState(initialReaderState?.activeIndex ?? 0);
  const [fontSizePt, setFontSizePt] = useState(initialReaderState?.fontSizePt ?? DEFAULT_FONT_PT);
  const [quranScript, setQuranScript] = useState(normalizeScript(initialReaderState?.quranScript));
  const [timeMode, setTimeMode] = useState(initialReaderState?.timeMode ?? "pagi");
  const [navDirection, setNavDirection] = useState("next");
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(initialReaderState?.settingsOpen ?? false);
  const [resetNonce, setResetNonce] = useState(0);
  const [legacyIosSafariMode, setLegacyIosSafariMode] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const touchStartRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);
  const cardStageRef = useRef(null);
  const lastWrittenFontRef = useRef(initialReaderState?.fontSizePt ?? DEFAULT_FONT_PT);
  const lastWrittenScriptRef = useRef(normalizeScript(initialReaderState?.quranScript));
  const lastWrittenTimeModeRef = useRef(initialReaderState?.timeMode ?? "pagi");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!initialReaderState?.hasFontQuery) {
      const savedFontSizeMode = window.localStorage.getItem(`${data.slug}-font-size-mode`);
      const parsedFontPt = savedFontSizeMode === null ? NaN : Number(savedFontSizeMode);
      if (Number.isFinite(parsedFontPt)) {
        setFontSizePt(Math.min(MAX_FONT_PT, Math.max(MIN_FONT_PT, parsedFontPt)));
      }
    }

    if (!initialReaderState?.hasScriptQuery) {
      const savedQuranScript = window.localStorage.getItem(`${data.slug}-quran-script`);
      if (savedQuranScript) {
        setQuranScript(normalizeScript(savedQuranScript));
      }
    }

    if (!initialReaderState?.hasTimeModeQuery) {
      const savedTimeMode = window.localStorage.getItem(`${data.slug}-time-mode`);
      if (savedTimeMode === "pagi" || savedTimeMode === "petang") {
        setTimeMode(savedTimeMode);
      }
    }
  }, [data.slug, initialReaderState?.hasFontQuery, initialReaderState?.hasScriptQuery, initialReaderState?.hasTimeModeQuery]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(`${data.slug}-active-index`, String(activeIndex));

    const params = new URLSearchParams(window.location.search);
    params.set("i", String(activeIndex));
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?${params.toString()}`);
  }, [activeIndex, data.slug]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (lastWrittenFontRef.current === fontSizePt) {
      return;
    }
    lastWrittenFontRef.current = fontSizePt;
    window.localStorage.setItem(`${data.slug}-font-size-mode`, String(fontSizePt));
  }, [data.slug, fontSizePt]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (lastWrittenScriptRef.current === quranScript) {
      return;
    }
    lastWrittenScriptRef.current = quranScript;
    window.localStorage.setItem(`${data.slug}-quran-script`, quranScript);
  }, [data.slug, quranScript]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (lastWrittenTimeModeRef.current === timeMode) {
      return;
    }
    lastWrittenTimeModeRef.current = timeMode;
    window.localStorage.setItem(`${data.slug}-time-mode`, timeMode);
  }, [data.slug, timeMode]);

  useEffect(() => {
    onTimeModeChange(timeMode);
  }, [onTimeModeChange, timeMode]);

  useEffect(() => {
    onChromeHiddenChange(true);
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
    const isAppleTouchDevice = /iPhone|iPad|iPod/i.test(userAgent);
    const isSafariBrowser = /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(userAgent);
    const iosVersionMatch = userAgent.match(/OS (\d+)_/i);
    const iosMajorVersion = iosVersionMatch ? Number(iosVersionMatch[1]) : null;
    setLegacyIosSafariMode(Boolean(isAppleTouchDevice && isSafariBrowser && iosMajorVersion && iosMajorVersion <= 15));
  }, []);

  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        window.clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (mobileSettingsOpen || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      } else if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        cardStageRef.current?.querySelector(".tap-zone")?.click();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileSettingsOpen]);

  function revealControls() {
    setControlsVisible(true);
    if (hideControlsTimeoutRef.current) {
      window.clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 2500);
  }

  function hideControlsNow() {
    if (hideControlsTimeoutRef.current) {
      window.clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
    setControlsVisible(false);
  }

  function isHoverCapable() {
    return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(hover: hover)").matches;
  }

  function handleFrameMouseEnter() {
    if (!isHoverCapable()) {
      return;
    }
    revealControls();
  }

  function handleFrameMouseLeave() {
    if (!isHoverCapable()) {
      return;
    }
    hideControlsNow();
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

  function handleFrameTouchStart(event) {
    if (mobileSettingsOpen || event.touches.length !== 1) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    revealControls();
  }

  function handleFrameTouchEnd(event) {
    const start = touchStartRef.current;
    touchStartRef.current = null;

    if (!start || mobileSettingsOpen) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE || Math.abs(deltaX) < Math.abs(deltaY) * 1.3) {
      return;
    }

    if (deltaX < 0) {
      showNext();
    } else {
      showPrevious();
    }
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

    params.set("focus", "1");
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
  const closeHref = `/${data.slug}`;

  return (
    <section className={`reader-mode-shell${darkMode ? " reader-dark" : ""}${legacyIosSafariMode ? " reader-legacy-mobile" : ""}`}>
      <div className="reader-focus-bar">
        <a className="reader-focus-settings" href={settingsHref} onClick={(event) => runAsSpa(event, () => setMobileSettingsOpen(true))} aria-label="Pengaturan bacaan">
          <span aria-hidden="true">&#9881;</span>
        </a>
        <a className="reader-focus-close" href={closeHref} onClick={(event) => runAsSpa(event, onClose)} aria-label="Tutup mode fokus">
          <span aria-hidden="true">&times;</span>
        </a>
      </div>

      {mobileSettingsOpen ? (
        <div className="reader-settings-sheet" role="dialog" aria-modal="true" aria-label="Pengaturan bacaan">
          <a className="reader-settings-backdrop" href={closeSettingsHref} onClick={(event) => runAsSpa(event, () => setMobileSettingsOpen(false))} aria-label="Tutup pengaturan" />
          <div className="reader-settings-panel">
            <div className="reader-settings-header">
              <div>
                <span className="reader-settings-kicker">Pengaturan</span>
                <h2 className="reader-settings-title">Sesuaikan tampilan baca</h2>
              </div>
              <a className="reader-settings-close" href={closeSettingsHref} onClick={(event) => runAsSpa(event, () => setMobileSettingsOpen(false))}>
                Tutup
              </a>
            </div>

            <div className="reader-settings-group">
              <span className="reader-settings-label">Mode tampilan</span>
              <div className="reader-segment reader-settings-segment">
                <a
                  className={`reader-segment-button${darkMode ? " active" : ""}`}
                  href={darkToggleHref}
                  onClick={(event) => runAsSpa(event, () => onDarkModeChange(!darkMode))}
                  style={darkMode ? { backgroundColor: theme.darkAccent, color: "white" } : {}}
                >
                  {darkMode ? "Dark On" : "Dark Off"}
                </a>
              </div>
            </div>

            <div className="reader-settings-group">
              <span className="reader-settings-label">Waktu baca</span>
              <div className="reader-segment reader-settings-segment">
                <a
                  className={`reader-segment-button${timeMode === "pagi" ? " active" : ""}`}
                  href={morningHref}
                  onClick={(event) => runAsSpa(event, () => setTimeMode("pagi"))}
                  style={timeMode === "pagi" ? { backgroundColor: darkMode ? theme.darkAccent : theme.accent, color: "white" } : {}}
                >
                  Pagi
                </a>
                <a
                  className={`reader-segment-button${timeMode === "petang" ? " active" : ""}`}
                  href={eveningHref}
                  onClick={(event) => runAsSpa(event, () => setTimeMode("petang"))}
                  style={timeMode === "petang" ? { backgroundColor: darkMode ? theme.darkAccent : theme.accent, color: "white" } : {}}
                >
                  Petang
                </a>
              </div>
            </div>

            <div className="reader-settings-group">
              <span className="reader-settings-label">Gaya script Qur'an</span>
              <div className="reader-segment reader-settings-segment">
                {SCRIPT_OPTIONS.map((option) => (
                  <a
                    className={`reader-segment-button${quranScript === option.value ? " active" : ""}`}
                    href={buildReaderHref({ quranScript: option.value })}
                    key={option.value}
                    onClick={(event) => runAsSpa(event, () => setQuranScript(option.value))}
                    style={quranScript === option.value ? { backgroundColor: darkMode ? theme.darkAccent : theme.accent, color: "white" } : {}}
                  >
                    {option.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="reader-settings-group">
              <span className="reader-settings-label">Ukuran huruf</span>
              <div className="reader-settings-font-row">
                <a className="reader-segment-button reader-settings-font-button" href={smallerFontHref} onClick={(event) => runAsSpa(event, decreaseFont)} aria-disabled={fontSizePt <= MIN_FONT_PT}>
                  Perkecil
                </a>
                <span className="reader-font-indicator reader-settings-font-indicator">{fontSizePt}pt</span>
                <a className="reader-segment-button reader-settings-font-button" href={largerFontHref} onClick={(event) => runAsSpa(event, increaseFont)} aria-disabled={fontSizePt >= MAX_FONT_PT}>
                  Perbesar
                </a>
              </div>
            </div>

            <a className="reader-reset reader-settings-reset" href={resetHref} onClick={(event) => runAsSpa(event, handleResetAll)}>
              Reset semua hitungan
            </a>
          </div>
        </div>
      ) : null}

      <div
        className={`reader-mode-frame${controlsVisible ? " controls-visible" : ""}`}
        style={{ borderColor: darkMode ? `${theme.darkAccent}20` : `${theme.accent}18` }}
        onTouchStart={handleFrameTouchStart}
        onTouchEnd={handleFrameTouchEnd}
        onTouchCancel={() => { touchStartRef.current = null; }}
        onMouseEnter={handleFrameMouseEnter}
        onMouseLeave={handleFrameMouseLeave}
      >
        <a className="reader-mode-edge reader-mode-edge-prev" href={previousHref} onClick={(event) => runAsSpa(event, showPrevious)} aria-label="Sebelumnya">
          <span aria-hidden="true">&lsaquo;</span>
        </a>
        <a className="reader-mode-edge reader-mode-edge-next" href={nextHref} onClick={(event) => runAsSpa(event, showNext)} aria-label="Berikutnya">
          <span aria-hidden="true">&rsaquo;</span>
        </a>

        <div
          className={`reader-card-stage ${navDirection === "previous" ? "is-from-previous" : "is-from-next"}`}
          key={`${activeCard.titleArabic}-${activeIndex}-${timeMode}`}
          ref={cardStageRef}
        >
          <ZikirCard
            card={activeCard}
            currentCount={initialReaderState?.currentCount ?? 0}
            darkMode={darkMode}
            fontSizePt={fontSizePt}
            index={activeIndex}
            legacyHrefBuilder={buildReaderHref}
            preferInitialCount={initialReaderState?.hasCountQuery}
            quranScript={quranScript}
            resetNonce={resetNonce}
            storageKey={`${data.slug}-count-${activeIndex}`}
            theme={theme}
            timeMode={timeMode}
          />
        </div>
      </div>
    </section>
  );
}
