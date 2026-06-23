"use client";

import { useEffect, useState } from "react";
import AlmatsuratPage from "@/components/almatsurat-page";
import VersionReader from "@/components/version-reader";

export default function VersionScreen({ data, theme }) {
  const [darkMode, setDarkMode] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.localStorage.getItem(`${data.slug}-dark-mode`) === "true") {
      setDarkMode(true);
    }
  }, [data.slug]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(`${data.slug}-dark-mode`, String(darkMode));
  }, [darkMode, data.slug]);

  return (
    <AlmatsuratPage chromeHidden={chromeHidden} data={data} darkMode={darkMode} theme={theme}>
      <VersionReader
        darkMode={darkMode}
        onChromeHiddenChange={setChromeHidden}
        onDarkModeChange={setDarkMode}
        data={data}
        theme={theme}
      />
    </AlmatsuratPage>
  );
}
