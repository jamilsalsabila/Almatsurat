"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { applyTimeMode } from "@/lib/time-mode";

const arabicDigits = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];

function toArabicNumber(value) {
  return String(value)
    .split("")
    .map((char) => (/\d/.test(char) ? arabicDigits[Number(char)] : char))
    .join("");
}

export default function ZikirCard({
  card,
  currentCount = 0,
  darkMode = false,
  theme,
  fontSizePt = 12,
  index,
  legacyHrefBuilder = null,
  legacyMode = false,
  onFocus,
  storageKey,
  readerMode = false,
  touchMode = false,
  timeMode = "pagi",
}) {
  const [count, setCount] = useState(currentCount);
  const progress = Math.min((count / card.count) * 100, 100);
  const complete = count >= card.count;
  const [isPressing, setIsPressing] = useState(false);
  const lastTouchRef = useRef(0);
  const basmallahEntries = card.entries.filter((entry) => entry.type === "basmallah");
  const mainEntries = card.entries.filter((entry) => entry.type !== "basmallah");

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") {
      return;
    }

    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      return;
    }

    const parsed = Number(saved);
    if (Number.isFinite(parsed) && parsed >= 0) {
      setCount(Math.min(parsed, card.count));
    }
  }, [card.count, currentCount, legacyMode, storageKey]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, String(count));
  }, [count, storageKey]);

  function handleTap() {
    setCount((current) => (current >= card.count ? 0 : current + 1));
  }

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

  const dynamicFontVars = readerMode
    ? {
        "--reader-quran-size": `${fontSizePt}pt`,
        "--reader-doa-size": `${Math.max(fontSizePt - 1, 1)}pt`,
        "--reader-basmallah-size": `${fontSizePt + 1}pt`,
      }
    : {};
  const accentColor = darkMode ? theme.darkAccent : theme.accent;
  const accentLine = darkMode ? `${theme.darkAccent}28` : `${theme.accent}14`;
  const repeatBorder = darkMode ? `${theme.darkAccent}30` : `${theme.accent}20`;
  const sequenceBorder = darkMode ? `${theme.darkAccent}2f` : `${theme.accent}1f`;
  const sequenceColor = darkMode ? `${theme.darkAccent}cc` : `${theme.accent}aa`;
  const contextColor = darkMode ? "rgba(235, 241, 243, 0.76)" : `${theme.accent}bb`;
  const counterLabelColor = darkMode ? "rgba(235, 241, 243, 0.86)" : theme.accent;
  const counterValueColor = darkMode ? "#f2f5f6" : theme.accent;
  const nextLegacyCount = count >= card.count ? 0 : count + 1;
  const legacyCountHref = legacyHrefBuilder ? legacyHrefBuilder({ currentCount: nextLegacyCount }) : "#";

  return (
    <article
      className={`zikir-card mushaf-card${readerMode ? " reader-card" : ""}${darkMode ? " reader-dark-card" : ""}`}
      style={{ borderColor: accentLine, ...dynamicFontVars }}
    >
      <div className="zikir-card-header mushaf-card-header">
        <div className="mushaf-meta">
          <span className="mushaf-sequence" style={{ color: sequenceColor, borderColor: sequenceBorder }}>
            {toArabicNumber(index + 1)}
          </span>
          <span className="mushaf-rule" style={{ backgroundColor: darkMode ? `${theme.darkAccent}4a` : `${theme.accent}30` }} />
          <h2 className="zikir-title naskh-text" style={{ color: accentColor }}>
            {card.titleArabic}
          </h2>
        </div>
        <div className="repeat-badge mushaf-repeat" style={{ borderColor: repeatBorder, color: accentColor }}>
          <span className="mushaf-repeat-label">التكرار</span>
          <span className="mushaf-repeat-value naskh-text">{card.countArabic}</span>
        </div>
      </div>

      {readerMode ? (
        <div className="reader-context" style={{ color: contextColor }}>
          {timeMode === "pagi" ? "Mode pagi" : "Mode petang"}
        </div>
      ) : null}

      <div className="zikir-card-body mushaf-card-body">
        {basmallahEntries.length > 0 ? (
          <div className="basmallah-line quran-text">
            {basmallahEntries.map((entry, index) => (
              <span key={`basmallah-${index}`}>{applyTimeMode(entry.text, timeMode)}</span>
            ))}
          </div>
        ) : null}

        <div className={`reading-line ${card.scriptType === "doa" ? "doa naskh-text" : "quran-text"}`}>
          {mainEntries.map((entry, index) => (
            <span className="segment" key={`${entry.type}-${index}`}>
              <span>{applyTimeMode(entry.text, timeMode)}</span>
              {entry.type === "verse" ? <span className="ayat-number">{entry.ayatArabic}</span> : null}
            </span>
          ))}
        </div>
      </div>

      <div className="counter-area mushaf-counter-area">
        {!readerMode && onFocus ? (
          <div className="mushaf-actions">
            <button className="mushaf-focus-button" {...bindTouchPress(onFocus)} type="button">
              Fokus bacaan
            </button>
          </div>
        ) : null}
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: theme.accentStrong }} />
        </div>
        {legacyMode ? (
          <Link className={`tap-zone mushaf-tap-zone${isPressing ? " is-pressing" : ""}`} href={legacyCountHref}>
            <div className="counter-copy">
              <span className="counter-label" style={{ color: counterLabelColor }}>
                Hitungan bacaan
              </span>
              <div className="counter-inline">
                <span className="counter-value" style={{ color: counterValueColor }}>
                  {count} / {card.count}
                </span>
                <span className="counter-hint">
                  {complete ? "Ketuk untuk mengulang dari awal." : "Ketuk untuk menambah hitungan."}
                </span>
              </div>
            </div>
            <span
              className="counter-done mushaf-counter-button"
              style={{
                backgroundColor: complete ? `${darkMode ? theme.darkAccent : theme.accentStrong}18` : `${theme.chip}18`,
                color: complete ? (darkMode ? theme.darkAccent : theme.accentStrong) : theme.chip,
                borderColor: complete ? `${darkMode ? theme.darkAccent : theme.accentStrong}2d` : `${theme.chip}30`,
              }}
            >
              {complete ? "Ulangi" : "Tap"}
            </span>
          </Link>
        ) : (
          <button
            className={`tap-zone mushaf-tap-zone${isPressing ? " is-pressing" : ""}`}
            type="button"
            {...bindTouchPress(handleTap)}
            onPointerDown={() => setIsPressing(true)}
            onPointerUp={() => setIsPressing(false)}
            onPointerLeave={() => setIsPressing(false)}
            onPointerCancel={() => setIsPressing(false)}
          >
            <div className="counter-copy">
              <span className="counter-label" style={{ color: counterLabelColor }}>
                Hitungan bacaan
              </span>
              <div className="counter-inline">
                <span className="counter-value" style={{ color: counterValueColor }}>
                  {count} / {card.count}
                </span>
                <span className="counter-hint">
                  {complete ? "Ketuk untuk mengulang dari awal." : "Ketuk untuk menambah hitungan."}
                </span>
              </div>
            </div>
            <span
              className="counter-done mushaf-counter-button"
              style={{
                backgroundColor: complete ? `${darkMode ? theme.darkAccent : theme.accentStrong}18` : `${theme.chip}18`,
                color: complete ? (darkMode ? theme.darkAccent : theme.accentStrong) : theme.chip,
                borderColor: complete ? `${darkMode ? theme.darkAccent : theme.accentStrong}2d` : `${theme.chip}30`,
              }}
            >
              {complete ? "Ulangi" : "Tap"}
            </span>
          </button>
        )}
      </div>

      {!readerMode ? (
        <div className="mushaf-divider" aria-hidden="true">
          <span className="mushaf-divider-line" style={{ backgroundColor: `${theme.accent}20` }} />
          <span className="mushaf-divider-mark" style={{ color: `${theme.accent}90` }}>
            ۞
          </span>
          <span className="mushaf-divider-line" style={{ backgroundColor: `${theme.accent}20` }} />
        </div>
      ) : null}
    </article>
  );
}
