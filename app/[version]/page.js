import { notFound } from "next/navigation";
import VersionScreen from "@/components/version-screen";
import { getCollection, getTheme, getVersionList } from "@/lib/almatsurat";

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

export function generateStaticParams() {
  return getVersionList().map((version) => ({ version: version.slug }));
}

export async function generateMetadata({ params }) {
  const { version } = await params;
  const theme = getTheme(version);
  return {
    title: `${theme.label} | Almatsurat Web`,
    description: theme.subtitle,
  };
}

export default async function VersionPage({ params, searchParams }) {
  const { version } = await params;
  const query = await searchParams;
  const data = getCollection(version);
  if (!data) {
    notFound();
  }

  const theme = getTheme(version);
  const initialReaderState = {
    activeIndex: clampNumber(query?.i, 0, Math.max(data.cards.length - 1, 0), 0),
    fontSizePt: clampNumber(query?.font, 1, 72, 12),
    timeMode: query?.mode === "petang" ? "petang" : "pagi",
    darkMode: query?.theme === "dark",
    currentCount: clampNumber(query?.count, 0, 999, 0),
    hasQueryState: Boolean(query?.i || query?.font || query?.mode || query?.theme || query?.count),
  };

  return <VersionScreen data={data} initialReaderState={initialReaderState} theme={theme} />;
}
