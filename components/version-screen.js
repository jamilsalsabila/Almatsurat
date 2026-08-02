"use client";

import { useEffect, useState } from "react";
import AlmatsuratPage from "@/components/almatsurat-page";
import VersionList from "@/components/version-list";
import VersionReader from "@/components/version-reader";
import { pickRandomScene } from "@/lib/background-scenes";

export default function VersionScreen({ data, theme, initialReaderState }) {
  const [darkMode, setDarkMode] = useState(initialReaderState?.darkMode ?? false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState(initialReaderState?.timeMode ?? "pagi");
  const [backgroundScene, setBackgroundScene] = useState(() => pickRandomScene(initialReaderState?.timeMode ?? "pagi"));
  const [previousBackgroundScene, setPreviousBackgroundScene] = useState("");
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);
  const [focusIndex, setFocusIndex] = useState(
    initialReaderState?.focusOpen ? (initialReaderState?.activeIndex ?? 0) : null
  );

  function openFocus(index) {
    setFocusIndex(index);
    if (typeof window !== "undefined") {
      window.history.pushState({ focus: true }, "", `/${data.slug}?focus=1&i=${index}`);
    }
  }

  function closeFocus() {
    setFocusIndex(null);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/${data.slug}`);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handlePopState() {
      const params = new URLSearchParams(window.location.search);
      if (params.get("focus") === "1") {
        const parsedIndex = Number(params.get("i"));
        setFocusIndex(Number.isFinite(parsedIndex) ? parsedIndex : 0);
      } else {
        setFocusIndex(null);
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
      {focusIndex !== null ? (
        <VersionReader
          darkMode={darkMode}
          onChromeHiddenChange={setChromeHidden}
          onClose={closeFocus}
          onDarkModeChange={setDarkMode}
          onTimeModeChange={setBackgroundMode}
          data={data}
          initialReaderState={{ ...initialReaderState, activeIndex: focusIndex, hasQueryState: true }}
          theme={theme}
        />
      ) : (
        <VersionList data={data} darkMode={darkMode} onOpenCard={openFocus} theme={theme} timeMode={backgroundMode} />
      )}
    </AlmatsuratPage>
  );
}
