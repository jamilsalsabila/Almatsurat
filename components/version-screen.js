"use client";

import { useEffect, useState } from "react";
import AlmatsuratPage from "@/components/almatsurat-page";
import VersionReader from "@/components/version-reader";
import { pickRandomScene } from "@/lib/background-scenes";

export default function VersionScreen({ data, theme, initialReaderState }) {
  const [darkMode, setDarkMode] = useState(initialReaderState?.darkMode ?? false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState(initialReaderState?.timeMode ?? "pagi");
  const [backgroundScene, setBackgroundScene] = useState(() => pickRandomScene(initialReaderState?.timeMode ?? "pagi"));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (initialReaderState?.hasQueryState) {
      return;
    }

    if (window.localStorage.getItem(`${data.slug}-dark-mode`) === "true") {
      setDarkMode(true);
    }
  }, [data.slug, initialReaderState?.hasQueryState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(`${data.slug}-dark-mode`, String(darkMode));
  }, [darkMode, data.slug]);

  useEffect(() => {
    setBackgroundScene((current) => pickRandomScene(backgroundMode, current));
  }, [backgroundMode]);

  return (
    <AlmatsuratPage backgroundMode={backgroundMode} backgroundScene={backgroundScene} chromeHidden={chromeHidden} data={data} darkMode={darkMode} theme={theme}>
      <VersionReader
        darkMode={darkMode}
        onChromeHiddenChange={setChromeHidden}
        onDarkModeChange={setDarkMode}
        onTimeModeChange={setBackgroundMode}
        data={data}
        initialReaderState={initialReaderState}
        theme={theme}
      />
    </AlmatsuratPage>
  );
}
