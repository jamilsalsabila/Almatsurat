"use client";

import { useEffect, useState } from "react";
import { toArabicNumber } from "@/lib/arabic-numerals";
import { applyTimeMode } from "@/lib/time-mode";

const PREVIEW_LENGTH = 90;

function buildPreview(card, timeMode) {
  const firstEntry = card.entries.find((entry) => entry.type !== "basmallah") ?? card.entries[0];
  const text = applyTimeMode(firstEntry?.text ?? "", timeMode);
  return text.length > PREVIEW_LENGTH ? `${text.slice(0, PREVIEW_LENGTH)}...` : text;
}

export default function VersionList({ data, darkMode = false, onOpenCard, theme, timeMode = "pagi" }) {
  const [counts, setCounts] = useState({});
  const [lastReadIndex, setLastReadIndex] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextCounts = {};
    data.cards.forEach((card, index) => {
      const rawCount = window.localStorage.getItem(`${data.slug}-count-${index}`);
      const saved = rawCount === null ? NaN : Number(rawCount);
      nextCounts[index] = Number.isFinite(saved) ? Math.min(Math.max(saved, 0), card.count) : 0;
    });
    setCounts(nextCounts);

    const rawIndex = window.localStorage.getItem(`${data.slug}-active-index`);
    const savedIndex = rawIndex === null ? NaN : Number(rawIndex);
    setLastReadIndex(Number.isFinite(savedIndex) && savedIndex >= 0 && savedIndex < data.cards.length ? savedIndex : null);
  }, [data.cards, data.slug]);

  function runAsSpa(event, index) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    onOpenCard(index);
  }

  return (
    <div className={`version-list${darkMode ? " version-list-dark" : ""}`}>
      {data.cards.map((card, index) => {
        const count = counts[index] ?? 0;
        const complete = count >= card.count;
        const progress = Math.min((count / card.count) * 100, 100);
        const accentColor = darkMode ? theme.darkAccent : theme.accent;

        return (
          <a
            className={`version-list-card${complete ? " is-complete" : ""}`}
            href={`/${data.slug}?focus=1&i=${index}`}
            key={card.titleArabic + index}
            onClick={(event) => runAsSpa(event, index)}
            style={{ borderColor: darkMode ? `${theme.darkAccent}24` : `${theme.accent}18` }}
          >
            <div className="version-list-card-top">
              <span className="version-list-sequence" style={{ color: accentColor, borderColor: darkMode ? `${theme.darkAccent}2f` : `${theme.accent}1f` }}>
                {toArabicNumber(index + 1)}
              </span>
              <h2 className="naskh-text version-list-title" style={{ color: accentColor }}>
                {card.titleArabic}
              </h2>
              <span className="version-list-repeat naskh-text" style={{ color: accentColor }}>
                {card.countArabic}
              </span>
            </div>

            <p className="version-list-preview">{buildPreview(card, timeMode)}</p>

            <div className="version-list-footer">
              <div className="version-list-progress-track">
                <div className="version-list-progress-fill" style={{ width: `${progress}%`, backgroundColor: theme.accentStrong }} />
              </div>
              <span className="version-list-hint">
                {index === lastReadIndex ? "Terakhir dibaca · " : ""}
                {complete ? `Selesai ${count}/${card.count} · Ketuk untuk mode fokus` : `${count}/${card.count} · Ketuk untuk mode fokus`}
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
