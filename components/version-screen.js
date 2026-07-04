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
  const [previousBackgroundScene, setPreviousBackgroundScene] = useState("");
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);

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
    setBackgroundScene((current) => {
      const nextScene = pickRandomScene(backgroundMode, current);
      if (nextScene !== current) {
        setPreviousBackgroundScene(current);
        setIsSceneTransitioning(true);
      }
      return nextScene;
    });
  }, [backgroundMode]);

  useEffect(() => {
    if (!isSceneTransitioning) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSceneTransitioning(false);
      setPreviousBackgroundScene("");
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [isSceneTransitioning]);

  return (
    <AlmatsuratPage
      backgroundMode={backgroundMode}
      backgroundScene={backgroundScene}
      chromeHidden={chromeHidden}
      data={data}
      darkMode={darkMode}
      isSceneTransitioning={isSceneTransitioning}
      previousBackgroundScene={previousBackgroundScene}
      theme={theme}
    >
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
